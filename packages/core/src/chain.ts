import { firstValueFrom, Observable } from 'rxjs'
import { filter, map } from 'rxjs/operators'
import { Chain, ProviderRpcErrorCode } from '@web3-onboard/common'
import { addNewChain, switchChain } from './provider.js'
import { state } from './store/index.js'
import { switchChainModal$ } from './streams.js'
import { validateSetChainOptions } from './validation.js'
import type { WalletState } from './types.js'
import { toHexString } from './utils.js'
import { updateChain } from './store/actions.js'

async function setChain(options: {
  chainId: string | number
  chainNamespace?: string
  wallet?: WalletState['label']
  rpcUrl?: string
  label?: string
  token?: string
}): Promise<boolean> {
  const error = validateSetChainOptions(options)

  if (error) {
    throw error
  }

  const { wallets, chains } = state.get()
  const {
    chainId,
    chainNamespace = 'evm',
    wallet: walletToSet,
    rpcUrl,
    label,
    token
  } = options
  const chainIdHex = toHexString(chainId)

  // validate that chainId has been added to chains
  const chain = chains.find(
    ({ namespace, id }) =>
      namespace === chainNamespace &&
      id.toLowerCase() === chainIdHex.toLowerCase()
  )

  if (!chain) {
    throw new Error(
      `Chain with chainId: ${chainId} and chainNamespace: ${chainNamespace} has not been set and must be added when Onboard is initialized.`
    )
  }

  const wallet = walletToSet
    ? wallets.find(({ label }) => label === walletToSet)
    : wallets[0]

  // validate a wallet is connected
  if (!wallet) {
    throw new Error(
      walletToSet
        ? `Wallet with label ${walletToSet} is not connected`
        : 'A wallet must be connected before a chain can be set'
    )
  }

  const [walletConnectedChain] = wallet.chains

  // check if wallet is already connected to chainId
  if (
    walletConnectedChain.namespace === chainNamespace &&
    walletConnectedChain.id === chainIdHex
  ) {
    return true
  }

  try {
    await switchChain(wallet.provider, chainIdHex)
    return true
  } catch (error) {
    const { code } = error as { code: number }
    const switchChainModalClosed$ = switchChainModal$.pipe(
      filter(x => x === null),
      map(() => false)
    )
    if (
      code === ProviderRpcErrorCode.CHAIN_NOT_ADDED ||
      code === ProviderRpcErrorCode.UNRECOGNIZED_CHAIN_ID
    ) {
      // chain has not been added to wallet
      if (rpcUrl || label || token) {
        if (rpcUrl) {
          chain.rpcUrl = rpcUrl
        }

        if (label) {
          chain.label = label
        }

        if (token) {
          chain.token = token
        }

        updateChain(chain)
      }

      // add chain to wallet
      return chainNotInWallet(
        wallet,
        chain,
        switchChainModalClosed$,
        chainIdHex
      )
    }

    if (code === ProviderRpcErrorCode.UNSUPPORTED_METHOD) {
      // method not supported
      switchChainModal$.next({ chain })
      return firstValueFrom(switchChainModalClosed$)
    }
  }

  return false
}

const chainNotInWallet = async (
  wallet: WalletState,
  chain: Chain,
  switchChainModalClosed$: Observable<boolean>,
  chainIdHex: string
): Promise<boolean> => {
  try {
    await addNewChain(wallet.provider, chain)
    await switchChain(wallet.provider, chainIdHex)
    return true
  } catch (error) {
    const { code } = error as { code: number }
    if (code === ProviderRpcErrorCode.ACCOUNT_ACCESS_REJECTED) {
      // add new chain rejected by user
      return false
    }
    // display notification to user to switch chain
    switchChainModal$.next({ chain })
    return firstValueFrom(switchChainModalClosed$)
  }
}

export default setChain
