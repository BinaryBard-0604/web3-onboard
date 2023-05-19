import { fromEventPattern, Observable } from 'rxjs'
import { filter, takeUntil, take, share, switchMap } from 'rxjs/operators'
import partition from 'lodash.partition'
import { providers, utils } from 'ethers'
import { weiToEth } from '@web3-onboard/common'
import { disconnectWallet$ } from './streams.js'
import { updateAccount, updateWallet } from './store/actions.js'
import { validEnsChain } from './utils.js'
import disconnect from './disconnect.js'
import { state } from './store/index.js'
import { getBNMulitChainSdk } from './services.js'
import { configuration } from './configuration.js'

import type {
  ChainId,
  EIP1102Request,
  EIP1193Provider,
  ProviderAccounts,
  Chain,
  AccountsListener,
  ChainListener,
  SelectAccountsRequest
} from '@web3-onboard/common'

import type {
  Account,
  Address,
  Balances,
  Ens,
  WalletPermission,
  WalletState
} from './types.js'

import type { Uns } from '@web3-onboard/unstoppable-resolution'
import { updateSecondaryTokens } from './update-balances'

export const ethersProviders: {
  [key: string]: providers.StaticJsonRpcProvider
} = {}

export function getProvider(chain: Chain): providers.StaticJsonRpcProvider {
  if (!chain) return null

  if (!ethersProviders[chain.rpcUrl]) {
    ethersProviders[chain.rpcUrl] = new providers.StaticJsonRpcProvider(
      chain.providerConnectionInfo && chain.providerConnectionInfo.url
        ? chain.providerConnectionInfo
        : chain.rpcUrl
    )
  }

  return ethersProviders[chain.rpcUrl]
}

export function requestAccounts(
  provider: EIP1193Provider
): Promise<ProviderAccounts> {
  const args = { method: 'eth_requestAccounts' } as EIP1102Request
  return provider.request(args)
}

export function selectAccounts(
  provider: EIP1193Provider
): Promise<ProviderAccounts> {
  const args = { method: 'eth_selectAccounts' } as SelectAccountsRequest
  return provider.request(args)
}

export function getChainId(provider: EIP1193Provider): Promise<string> {
  return provider.request({ method: 'eth_chainId' }) as Promise<string>
}

export function listenAccountsChanged(args: {
  provider: EIP1193Provider
  disconnected$: Observable<string>
}): Observable<ProviderAccounts> {
  const { provider, disconnected$ } = args

  const addHandler = (handler: AccountsListener) => {
    provider.on('accountsChanged', handler)
  }

  const removeHandler = (handler: AccountsListener) => {
    provider.removeListener('accountsChanged', handler)
  }

  return fromEventPattern<ProviderAccounts>(addHandler, removeHandler).pipe(
    takeUntil(disconnected$)
  )
}

export function listenChainChanged(args: {
  provider: EIP1193Provider
  disconnected$: Observable<string>
}): Observable<ChainId> {
  const { provider, disconnected$ } = args
  const addHandler = (handler: ChainListener) => {
    provider.on('chainChanged', handler)
  }

  const removeHandler = (handler: ChainListener) => {
    provider.removeListener('chainChanged', handler)
  }

  return fromEventPattern<ChainId>(addHandler, removeHandler).pipe(
    takeUntil(disconnected$)
  )
}

export function trackWallet(
  provider: EIP1193Provider,
  label: WalletState['label']
): void {
  const disconnected$ = disconnectWallet$.pipe(
    filter(wallet => wallet === label),
    take(1)
  )

  const accountsChanged$ = listenAccountsChanged({
    provider,
    disconnected$
  }).pipe(share())

  // when account changed, set it to first account and subscribe to events
  accountsChanged$.subscribe(async ([address]) => {
    // sync accounts with internal state
    // in the case of an account has been manually disconnected
    try {
      await syncWalletConnectedAccounts(label)
    } catch (error) {
      console.warn(
        'Web3Onboard: Error whilst trying to sync connected accounts:',
        error
      )
    }

    // no address, then no account connected, so disconnect wallet
    // this could happen if user locks wallet,
    // or if disconnects app from wallet
    if (!address) {
      disconnect({ label })
      return
    }

    const { wallets } = state.get()
    const { accounts } = wallets.find(wallet => wallet.label === label)

    const [[existingAccount], restAccounts] = partition(
      accounts,
      account => account.address === address
    )

    // update accounts without ens/uns and balance first
    updateWallet(label, {
      accounts: [
        existingAccount || {
          address: address,
          ens: null,
          uns: null,
          balance: null
        },
        ...restAccounts
      ]
    })

    // if not existing account and notifications,
    // then subscribe to transaction events
    if (state.get().notify.enabled && !existingAccount) {
      const sdk = await getBNMulitChainSdk()

      if (sdk) {
        const wallet = state
          .get()
          .wallets.find(wallet => wallet.label === label)
        try {
          sdk.subscribe({
            id: address,
            chainId: wallet.chains[0].id,
            type: 'account'
          })
        } catch (error) {
          // unsupported network for transaction events
        }
      }
    }
  })

  // also when accounts change, update Balance and ENS/UNS
  accountsChanged$
    .pipe(
      switchMap(async ([address]) => {
        if (!address) return

        const { wallets, chains } = state.get()

        const primaryWallet = wallets.find(wallet => wallet.label === label)
        const { chains: walletChains, accounts } = primaryWallet

        const [connectedWalletChain] = walletChains

        const chain = chains.find(
          ({ namespace, id }) =>
            namespace === 'evm' && id === connectedWalletChain.id
        )

        const balanceProm = getBalance(address, chain)
        const secondaryTokenBal = updateSecondaryTokens(
          primaryWallet,
          address,
          chain
        )
        const account = accounts.find(account => account.address === address)

        const ensProm =
          account && account.ens
            ? Promise.resolve(account.ens)
            : validEnsChain(connectedWalletChain.id)
            ? getEns(address, chain)
            : Promise.resolve(null)

        const unsProm =
          account && account.uns
            ? Promise.resolve(account.uns)
            : getUns(address, chain)

        return Promise.all([
          Promise.resolve(address),
          balanceProm,
          ensProm,
          unsProm,
          secondaryTokenBal
        ])
      })
    )
    .subscribe(res => {
      if (!res) return
      const [address, balance, ens, uns, secondaryTokens] = res
      updateAccount(label, address, { balance, ens, uns, secondaryTokens })
    })

  const chainChanged$ = listenChainChanged({ provider, disconnected$ }).pipe(
    share()
  )

  // Update chain on wallet when chainId changed
  chainChanged$.subscribe(async chainId => {
    const { wallets } = state.get()
    const { chains, accounts } = wallets.find(wallet => wallet.label === label)
    const [connectedWalletChain] = chains

    if (chainId === connectedWalletChain.id) return

    if (state.get().notify.enabled) {
      const sdk = await getBNMulitChainSdk()

      if (sdk) {
        const wallet = state
          .get()
          .wallets.find(wallet => wallet.label === label)

        // Unsubscribe with timeout of 60 seconds
        // to allow for any currently inflight transactions
        wallet.accounts.forEach(({ address }) => {
          sdk.unsubscribe({
            id: address,
            chainId: wallet.chains[0].id,
            timeout: 60000
          })
        })

        // resubscribe for new chainId
        wallet.accounts.forEach(({ address }) => {
          try {
            sdk.subscribe({
              id: address,
              chainId: chainId,
              type: 'account'
            })
          } catch (error) {
            // unsupported network for transaction events
          }
        })
      }
    }

    const resetAccounts = accounts.map(
      ({ address }) =>
        ({
          address,
          ens: null,
          uns: null,
          balance: null
        } as Account)
    )

    updateWallet(label, {
      chains: [{ namespace: 'evm', id: chainId }],
      accounts: resetAccounts
    })
  })

  // when chain changes get ens/uns and balance for each account for wallet
  chainChanged$
    .pipe(
      switchMap(async chainId => {
        const { wallets, chains } = state.get()
        const primaryWallet = wallets.find(wallet => wallet.label === label)
        const { accounts } = primaryWallet

        const chain = chains.find(
          ({ namespace, id }) => namespace === 'evm' && id === chainId
        )

        return Promise.all(
          accounts.map(async ({ address }) => {
            const balanceProm = getBalance(address, chain)

            const secondaryTokenBal = updateSecondaryTokens(
              primaryWallet,
              address,
              chain
            )

            const ensProm = validEnsChain(chainId)
              ? getEns(address, chain)
              : Promise.resolve(null)

            const unsProm = validEnsChain(chainId)
              ? getUns(address, chain)
              : Promise.resolve(null)

            const [balance, ens, uns, secondaryTokens] = await Promise.all([
              balanceProm,
              ensProm,
              unsProm,
              secondaryTokenBal
            ])

            return {
              address,
              balance,
              ens,
              uns,
              secondaryTokens
            }
          })
        )
      })
    )
    .subscribe(updatedAccounts => {
      updatedAccounts && updateWallet(label, { accounts: updatedAccounts })
    })

  disconnected$.subscribe(() => {
    provider.disconnect && provider.disconnect()
  })
}

export async function getEns(
  address: Address,
  chain: Chain
): Promise<Ens | null> {
  // chain we don't recognize and don't have a rpcUrl for requests
  if (!chain) return null

  const provider = getProvider(chain)

  try {
    const name = await provider.lookupAddress(address)
    let ens = null

    if (name) {
      const resolver = await provider.getResolver(name)

      if (resolver) {
        const [contentHash, avatar] = await Promise.all([
          resolver.getContentHash(),
          resolver.getAvatar()
        ])

        const getText = resolver.getText.bind(resolver)

        ens = {
          name,
          avatar,
          contentHash,
          getText
        }
      }
    }

    return ens
  } catch (error) {
    console.error(error)
    return null
  }
}

export async function getUns(
  address: Address,
  chain: Chain
): Promise<Uns | null> {
  const { unstoppableResolution } = configuration

  // check if address is valid ETH address before attempting to resolve
  // chain we don't recognize and don't have a rpcUrl for requests
  if (!unstoppableResolution || !utils.isAddress(address) || !chain) return null

  try {
    return await unstoppableResolution(address)
  } catch (error) {
    console.error(error)
    return null
  }
}

export async function getBalance(
  address: string,
  chain: Chain
): Promise<Balances | null> {
  // chain we don't recognize and don't have a rpcUrl for requests
  if (!chain) return null

  const { wallets } = state.get()

  try {
    const wallet = wallets.find(wallet => !!wallet.provider)
    const provider = wallet.provider
    const balanceHex = await provider.request({
      method: 'eth_getBalance',
      params: [address, 'latest']
    })
    return balanceHex ? { [chain.token || 'eth']: weiToEth(balanceHex) } : null
  } catch (error) {
    console.error(error)
    return null
  }
}

export function switchChain(
  provider: EIP1193Provider,
  chainId: ChainId
): Promise<unknown> {
  return provider.request({
    method: 'wallet_switchEthereumChain',
    params: [{ chainId }]
  })
}

export function addNewChain(
  provider: EIP1193Provider,
  chain: Chain
): Promise<unknown> {
  return provider.request({
    method: 'wallet_addEthereumChain',
    params: [
      {
        chainId: chain.id,
        chainName: chain.label,
        nativeCurrency: {
          name: chain.label,
          symbol: chain.token,
          decimals: 18
        },
        rpcUrls: [chain.publicRpcUrl || chain.rpcUrl],
        blockExplorerUrls: chain.blockExplorerUrl
          ? [chain.blockExplorerUrl]
          : undefined
      }
    ]
  })
}

export function updateChainRPC(
  provider: EIP1193Provider,
  chain: Chain,
  rpcUrl: string
): Promise<unknown> {
  return provider.request({
    method: 'wallet_addEthereumChain',
    params: [
      {
        chainId: chain.id,
        chainName: chain.label,
        nativeCurrency: {
          name: chain.label,
          symbol: chain.token,
          decimals: 18
        },
        rpcUrls: [rpcUrl],
        blockExplorerUrls: chain.blockExplorerUrl
          ? [chain.blockExplorerUrl]
          : undefined
      }
    ]
  })
}

export async function getPermissions(
  provider: EIP1193Provider
): Promise<WalletPermission[]> {
  try {
    const permissions = (await provider.request({
      method: 'wallet_getPermissions'
    })) as WalletPermission[]

    return Array.isArray(permissions) ? permissions : []
  } catch (error) {
    return []
  }
}

export async function syncWalletConnectedAccounts(
  label: WalletState['label']
): Promise<void> {
  const wallet = state.get().wallets.find(wallet => wallet.label === label)
  const permissions = await getPermissions(wallet.provider)
  const accountsPermissions = permissions.find(
    ({ parentCapability }) => parentCapability === 'eth_accounts'
  )

  if (accountsPermissions) {
    const { value: connectedAccounts } = accountsPermissions.caveats.find(
      ({ type }) => type === 'restrictReturnedAccounts'
    ) || { value: null }

    if (connectedAccounts) {
      const syncedAccounts = wallet.accounts.filter(({ address }) =>
        connectedAccounts.includes(address)
      )

      updateWallet(wallet.label, { ...wallet, accounts: syncedAccounts })
    }
  }
}
