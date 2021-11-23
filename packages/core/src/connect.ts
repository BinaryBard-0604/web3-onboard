import { firstValueFrom } from 'rxjs'
import { filter, withLatestFrom, pluck } from 'rxjs/operators'
import { state } from './store'
import { connectWallet$, wallets$ } from './streams'
import type { ConnectOptions, WalletState } from './types'
import { validateConnectOptions } from './validation'

async function connect(options?: ConnectOptions): Promise<WalletState[]> {
  if (options) {
    const error = validateConnectOptions(options)
    if (error) {
      throw error
    }
  }

  const { chains } = state.get()

  // Wallets require the chains for initializing providers,
  // so we must ensure at least one is set
  if (!chains.length)
    throw new Error(
      'At least one chain must be set before attempting to connect a wallet'
    )

  const { autoSelect } = options || { autoSelect: '' }

  connectWallet$.next({ autoSelect, inProgress: true })

  const result$ = connectWallet$.pipe(
    filter(({ inProgress }) => inProgress === false),
    withLatestFrom(wallets$),
    pluck(1)
  )

  return firstValueFrom(result$)
}

export default connect
