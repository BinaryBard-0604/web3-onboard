import { networkName, networkToId } from '../../../utilities'
import {
  SdkWalletOptions,
  CommonWalletOptions,
  WalletModule,
  Helpers
} from '../../../interfaces'

import sqlkIcon from '../wallet-icons/icon-squarelink'

function squarelink(
  options: SdkWalletOptions & CommonWalletOptions
): WalletModule {
  const { apiKey, networkId, preferred, label, iconSrc, svg } = options

  return {
    name: label || 'Squarelink',
    svg: svg || sqlkIcon,
    iconSrc,
    wallet: async (helpers: Helpers) => {
      const { default: Squarelink } = await import('squarelink')

      const instance = new Squarelink(apiKey, networkName(networkId), {
        useSync: true
      })

      const provider = instance.getProviderSync()

      const { BigNumber } = helpers

      return {
        provider,
        instance,
        interface: {
          name: 'Squarelink',
          connect: provider.enable,
          address: {
            get: () => Promise.resolve(instance.accounts[0])
          },
          network: {
            get: () => Promise.resolve(networkToId(instance.network))
          },
          balance: {
            get: () =>
              new Promise(resolve => {
                if (!instance.accounts.length) {
                  resolve(null)
                  return
                }

                provider.sendAsync(
                  {
                    method: 'eth_getBalance',
                    params: [instance.accounts[0], 'latest'],
                    id: 1
                  },
                  (e: any, res: any) => {
                    resolve(BigNumber(res.result).toString(10))
                  }
                )
              })
          }
        }
      }
    },
    desktop: true,
    mobile: true,
    url: 'https://app.squarelink.com/',
    preferred
  }
}

export default squarelink
