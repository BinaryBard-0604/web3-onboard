import type {
  ScanAccountsOptions,
  Account,
  Asset,
  Chain,
  CustomNetwork,
  WalletInit,
  GetInterfaceHelpers,
  EIP1193Provider
} from '@web3-onboard/common'

// these cannot be dynamically imported
import { TypedDataUtils } from '@metamask/eth-sig-util'
import { Buffer } from 'buffer'

import type Transport from '@ledgerhq/hw-transport'
import type { providers } from 'ethers'
import type Eth from '@ledgerhq/hw-app-eth'

const LEDGER_LIVE_PATH = `m/44'/60'`
const LEDGER_DEFAULT_PATH = `m/44'/60'/0'`

const DEFAULT_BASE_PATHS = [
  {
    label: 'Ledger Live',
    value: LEDGER_LIVE_PATH
  },
  {
    label: 'Ledger Legacy',
    value: LEDGER_DEFAULT_PATH
  }
]

const assets = [
  {
    label: 'ETH'
  }
]

type CustomNavigator = Navigator & { usb: { getDevices(): void } }

const supportsWebUSB = (): Promise<boolean> =>
  Promise.resolve(
    !!navigator &&
      !!(navigator as CustomNavigator).usb &&
      typeof (navigator as CustomNavigator).usb.getDevices === 'function'
  )

/**
 * Returns the correct ledger transport based on browser compatibility for webUSB.
 * @returns
 */
const getTransport = async () =>
  ((await supportsWebUSB())
    ? (await import('@ledgerhq/hw-transport-webusb')).default
    : (await import('@ledgerhq/hw-transport-u2f')).default
  ).create()

const getAccount = async (
  derivationPath: string,
  asset: Asset,
  index: number,
  provider: providers.StaticJsonRpcProvider,
  eth: Eth
): Promise<Account> => {
  const dPath =
    derivationPath === LEDGER_LIVE_PATH
      ? `${derivationPath}/${index}'/0/0`
      : `${derivationPath}/${index}`
  const { address } = await eth.getAddress(dPath)
  return {
    derivationPath: dPath,
    address,
    balance: {
      asset: asset.label,
      value: await provider.getBalance(address)
    }
  }
}

const getAddresses = async (
  derivationPath: string,
  asset: Asset,
  provider: providers.StaticJsonRpcProvider,
  eth: Eth
): Promise<Account[]> => {
  const accounts = []
  let index = 0
  let zeroBalanceAccounts = 0

  // Iterates until a 0 balance account is found
  // Then adds 4 more 0 balance accounts to the array
  while (zeroBalanceAccounts < 5) {
    const acc = await getAccount(derivationPath, asset, index, provider, eth)
    if (acc.balance.value.isZero()) {
      zeroBalanceAccounts++
      accounts.push(acc)
    } else {
      accounts.push(acc)
      // Reset the number of 0 balance accounts
      zeroBalanceAccounts = 0
    }
    index++
  }

  return accounts
}

function ledger({
  customNetwork
}: {
  customNetwork?: CustomNetwork
} = {}): WalletInit {
  const getIcon = async () => (await import('./icon.js')).default
  return () => {
    let accounts: Account[] | undefined
    return {
      label: 'Ledger',
      getIcon,
      getInterface: async ({ EventEmitter, chains }: GetInterfaceHelpers) => {
        const Eth = (await import('@ledgerhq/hw-app-eth')).default
        const { default: Common, Hardfork } = await import('@ethereumjs/common')
        const ethUtil = await import('ethereumjs-util')

        const { SignTypedDataVersion } = await import('@metamask/eth-sig-util')
        const { StaticJsonRpcProvider } = await import(
          '@ethersproject/providers'
        )

        const { accountSelect, createEIP1193Provider, ProviderRpcError } =
          await import('@web3-onboard/common')

        const { TransactionFactory: Transaction, Capability } = await import(
          '@ethereumjs/tx'
        )

        const transport: Transport = await getTransport()
        const eth = new Eth(transport)
        const eventEmitter = new EventEmitter()

        let currentChain: Chain = chains[0]

        const scanAccounts = async ({
          derivationPath,
          chainId,
          asset
        }: ScanAccountsOptions): Promise<Account[]> => {
          try {
            currentChain =
              chains.find(({ id }: Chain) => id === chainId) || currentChain
            const provider = new StaticJsonRpcProvider(currentChain.rpcUrl)

            // Checks to see if this is a custom derivation path
            // If it is then just return the single account
            if (
              derivationPath !== LEDGER_LIVE_PATH &&
              derivationPath !== LEDGER_DEFAULT_PATH
            ) {
              const { address } = await eth.getAddress(derivationPath)
              return [
                {
                  derivationPath,
                  address,
                  balance: {
                    asset: asset.label,
                    value: await provider.getBalance(address)
                  }
                }
              ]
            }

            return getAddresses(derivationPath, asset, provider, eth)
          } catch (error) {
            const { statusText } = error as { statusText: string }
            throw new Error(
              statusText === 'UNKNOWN_ERROR'
                ? 'Ledger device is locked, please unlock to continue'
                : statusText
            )
          }
        }

        const getAccounts = async () => {
          accounts = await accountSelect({
            basePaths: DEFAULT_BASE_PATHS,
            assets,
            chains,
            scanAccounts
          })

          if (accounts && accounts.length) {
            eventEmitter.emit('accountsChanged', [accounts[0].address])
          }

          return accounts
        }

        const request: EIP1193Provider['request'] = async ({
          method,
          params
        }) => {
          const response = await fetch(currentChain.rpcUrl, {
            method: 'POST',
            body: JSON.stringify({
              id: '42',
              method,
              params
            })
          }).then(res => res.json())

          if (response.result) {
            return response.result
          } else {
            throw response.error
          }
        }

        const ledgerProvider = { request }

        const provider = createEIP1193Provider(ledgerProvider, {
          eth_requestAccounts: async () => {
            // Triggers the account select modal if no accounts have been selected
            const accounts = await getAccounts()
            if (!Array.isArray(accounts))
              throw new Error(
                'No account selected. Must call eth_requestAccounts first.'
              )
            if (accounts.length === 0) {
              throw new ProviderRpcError({
                code: 4001,
                message: 'User rejected the request.'
              })
            }
            if (!accounts[0].hasOwnProperty('address'))
              throw new Error(
                'No address property associated with the selected account'
              )
            return [accounts[0].address]
          },
          eth_selectAccounts: async () => {
            const accounts = await getAccounts()
            return accounts.map(({ address }) => address)
          },
          eth_accounts: async () => {
            return Array.isArray(accounts) &&
              accounts.length &&
              accounts[0].hasOwnProperty('address')
              ? [accounts[0].address]
              : []
          },
          eth_chainId: async () => {
            return (currentChain && currentChain.id) || ''
          },
          eth_signTransaction: async ({ params: [transactionObject] }) => {
            if (!accounts || !Array.isArray(accounts) || !accounts.length)
              throw new Error(
                'No account selected. Must call eth_requestAccounts first.'
              )

            let account
            if (transactionObject.hasOwnProperty('from')) {
              account = accounts.find(
                account => account.address === transactionObject.from
              )
            }
            account = account ? account : accounts[0]

            const { address: from, derivationPath } = account

            // Set the `from` field to the currently selected account
            transactionObject = { ...transactionObject, from }

            // @ts-ignore
            const CommonConstructor = Common.default || Common
            const common = new CommonConstructor({
              chain:
                customNetwork || currentChain.hasOwnProperty('id')
                  ? Number.parseInt(currentChain.id)
                  : 1,
              // Berlin is the minimum hardfork that will allow for EIP1559
              hardfork: Hardfork.Berlin,
              // List of supported EIPS
              eips: [1559]
            })

            transactionObject.gasLimit =
              transactionObject.gas || transactionObject.gasLimit

            const transaction = Transaction.fromTxData(
              {
                ...transactionObject
              },
              { common }
            )

            let unsignedTx = transaction.getMessageToSign(false)

            // If this is not an EIP1559 transaction then it is legacy and it needs to be
            // rlp encoded before being passed to ledger
            if (!transaction.supports(Capability.EIP1559FeeMarket)) {
              unsignedTx = ethUtil.rlp.encode(unsignedTx)
            }

            const { v, r, s } = await eth.signTransaction(
              derivationPath,
              unsignedTx.toString('hex')
            )

            // Reconstruct the signed transaction
            const signedTx = Transaction.fromTxData(
              {
                ...transactionObject,
                v: `0x${v}`,
                r: `0x${r}`,
                s: `0x${s}`
              },
              { common }
            )

            return signedTx ? `0x${signedTx.serialize().toString('hex')}` : ''
          },
          eth_sendTransaction: async ({ baseRequest, params }) => {
            const signedTx = await provider.request({
              method: 'eth_signTransaction',
              params
            })

            const transactionHash = await baseRequest({
              method: 'eth_sendRawTransaction',
              params: [signedTx]
            })

            return transactionHash as string
          },
          eth_sign: async ({ params: [address, message] }) => {
            if (!(accounts && accounts.length && accounts.length > 0))
              throw new Error(
                'No account selected. Must call eth_requestAccounts first.'
              )

            const account =
              accounts.find(account => account.address === address) ||
              accounts[0]

            return eth
              .signPersonalMessage(
                account.derivationPath,
                Buffer.from(message).toString('hex')
              )
              .then(result => {
                let v = (result['v'] - 27).toString(16)
                if (v.length < 2) {
                  v = '0' + v
                }

                return `0x${result['r']}${result['s']}${v}`
              })
          },
          eth_signTypedData: async ({ params: [address, typedData] }) => {
            if (!(accounts && accounts.length && accounts.length > 0))
              throw new Error(
                'No account selected. Must call eth_requestAccounts first.'
              )

            const account =
              accounts.find(account => account.address === address) ||
              accounts[0]

            const domainHash = TypedDataUtils.hashStruct(
              'EIP712Domain',
              typedData.domain,
              typedData.types,
              SignTypedDataVersion.V3
            ).toString('hex')

            const messageHash = TypedDataUtils.hashStruct(
              typedData.primaryType,
              typedData.message,
              typedData.types,
              SignTypedDataVersion.V3
            ).toString('hex')

            return eth
              .signEIP712HashedMessage(
                account.derivationPath,
                domainHash,
                messageHash
              )
              .then(result => {
                let v = (result['v'] - 27).toString(16)
                if (v.length < 2) {
                  v = '0' + v
                }

                return `0x${result['r']}${result['s']}${v}`
              })
          },
          wallet_switchEthereumChain: async ({ params: [{ chainId }] }) => {
            currentChain =
              chains.find(({ id }) => id === chainId) || currentChain
            if (!currentChain)
              throw new Error('chain must be set before switching')

            eventEmitter.emit('chainChanged', currentChain.id)
            return null
          },
          wallet_addEthereumChain: null
        })

        provider.on = eventEmitter.on.bind(eventEmitter)

        return {
          provider
        }
      }
    }
  }
}

export default ledger
