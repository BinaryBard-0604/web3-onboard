import type { Configuration } from './types.js'
import { getDevice } from './utils.js'

export let configuration: Configuration = {
  svelteInstance: null,
  apiKey: null,
  device: getDevice(),
  initialWalletInit: [],
  gas: null,
  containerElements: { accountCenter: null, connectModal: null },
  transactionPreview: null,
  unstoppableResolution: null
}

export function updateConfiguration(update: Partial<Configuration>): void {
  configuration = { ...configuration, ...update }
}
