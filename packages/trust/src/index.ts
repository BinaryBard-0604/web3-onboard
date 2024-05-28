import {
  type WalletInit,
  type EIP1193Provider,
  createDownloadMessage
} from '@web3-onboard/common'
import { CustomWindow } from './types.js'
declare const window: CustomWindow

function trust(): WalletInit {
  if (typeof window === 'undefined') return () => null

  return () => {
    return {
      label: 'Trust Wallet',
      getIcon: async () => (await import('./icon.js')).default,
      getInterface: async () => {
        const ethereumInjectionExists = window.hasOwnProperty('ethereum')

        let provider: EIP1193Provider

        // check if trust is injected into window.ethereum
        if (ethereumInjectionExists && window['ethereum'].isTrust) {
          provider = window['ethereum']
        } else if (window['trustwallet']) {
          // directly use the window.trustwallet injection
          provider = window['trustwallet']
        } else {
          // trustwallet extension is not installed
          // send user to install page
          throw new Error(
            createDownloadMessage(
              'Trust Wallet',
              'https://trustwallet.com/browser-extension'
            )
          )
        }

        return {
          provider
        }
      }
    }
  }
}

export default trust
