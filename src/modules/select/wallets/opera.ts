import { extensionInstallMessage } from '../content'
import { WalletModule, Helpers, CommonWalletOptions } from '../../../interfaces'

import operaIcon from '../wallet-icons/icon-opera.png'
import operaIcon2x from '../wallet-icons/icon-opera@2x.png'

function opera(options: CommonWalletOptions): WalletModule {
  const { preferred, label, iconSrc, svg } = options

  return {
    name: label || 'Opera',
    iconSrc: iconSrc || operaIcon,
    iconSrcSet: iconSrc || operaIcon2x,
    svg,
    wallet: async (helpers: Helpers) => {
      const { getProviderName, createModernProviderInterface } = helpers

      const provider =
        (window as any).ethereum ||
        ((window as any).web3 && (window as any).web3.currentProvider)

      return {
        provider,
        interface:
          provider && getProviderName(provider) === undefined
            ? createModernProviderInterface(provider)
            : null
      }
    },
    type: 'injected',
    link: 'https://www.opera.com/',
    installMessage: extensionInstallMessage,
    desktop: true,
    mobile: true,
    preferred,
    osExclusions: ['iOS']
  }
}

export default opera
