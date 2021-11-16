import { state } from './store'
import { removeWallet } from './store/actions'
import { disconnectWallet$ } from './streams'
import type { DisconnectOptions, WalletState } from './types'
import { validateDisconnectOptions } from './validation'

async function disconnect(options: DisconnectOptions): Promise<WalletState[]> {
  const error = validateDisconnectOptions(options)
  if (error) {
    throw error
  }

  const { label } = options

  disconnectWallet$.next(label)
  removeWallet(label)

  return state.get().wallets
}

export default disconnect
