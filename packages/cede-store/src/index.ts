import { CedeProvider, detectCedeProvider } from '@cedelabs/providers'
import type { ProviderAccounts, WalletInit } from '@web3-onboard/common'
import {
  createDownloadMessage,
  createEIP1193Provider
} from '@web3-onboard/common'

type CustomWindow = typeof window & {
  cede: CedeProvider
}

function cedeStoreWallet(): WalletInit {
  if (typeof window === 'undefined') return () => null
  return () => ({
    label: 'cede.store',
    injectedNamespace: 'cede',
    checkProviderIdentity: () => (window as CustomWindow).cede,
    getIcon: async () => (await import('./icon.js')).default,
    getInterface: async () => {
      const provider = await detectCedeProvider()
      if (!provider) {
        throw new Error(
          createDownloadMessage('cede.store', 'https://cede.store')
        )
      }

      // handle disconnect
      provider.once('lock', () => {
        provider.emit('accountsChanged', [])
      })

      return Promise.resolve({
        provider: createEIP1193Provider(provider, {
          eth_requestAccounts: async () => {
            const accounts = await provider.request({
              method: 'connect'
            })

            if (!accounts.length) {
              return []
            }

            const activeVault = accounts.find(account => account.isActive)

            return [activeVault?.name || accounts[0].name] as ProviderAccounts
          },
          eth_chainId: () => Promise.resolve('0x1'), // cede.store doesn't support chains, but we have to provide a value to complete the connection
          wallet_switchEthereumChain: null,
          wallet_addEthereumChain: null,
          eth_getBalance: () => Promise.resolve('0x0'),
          eth_selectAccounts: null
        })
      })
    },
    platforms: ['desktop']
  })
}
export default cedeStoreWallet
