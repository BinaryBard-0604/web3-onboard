import { firstValueFrom, Subject } from 'rxjs'
import {
  ProviderRpcError,
  ProviderRpcErrorCode
} from '@web3-onboard/common'
import type {
  PatchedEIP1193Provider,
  TransactionPreviewInitOptions,
  TransactionPreviewModule,
  TransactionPreviewAPI,
  TransactionPreviewOptions,
  TransactionForSim,
  FullPreviewOptions
} from './types.js'
import type { EIP1193Provider } from '@web3-onboard/common'
import type {
  InternalTransaction,
  MultiSimOutput,
  NetBalanceChange
} from 'bnc-sdk'

import initI18N from './i18n/index.js'
import { validateTPInit, validateTPOptions } from './validation'
import simulateTransactions from './simulateTransactions.js'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
import TransactionPreview from './views/Index.svelte'

export * from './types.js'

const approved$ = new Subject<boolean>()
let options: FullPreviewOptions
let optionalSettings: TransactionPreviewOptions
let app: TransactionPreview

const destroyApp = () => {
  app.$destroy()
}

const handleRequireApproval = async (
  app: TransactionPreview,
  fullProviderRequest: EIP1193Provider['request'],
  req: {
    method: string
    params?: Array<unknown>
  }
) => {
  const approved = await firstValueFrom(approved$)
  app.$destroy()
  if (!approved) {
    throw new ProviderRpcError({
      code: ProviderRpcErrorCode.ACCOUNT_ACCESS_REJECTED,
      message: 'User rejected the transaction'
    })
  }
  fullProviderRequest(req)
}

const netBalanceChangesExist = (simResp: MultiSimOutput): boolean => {
  if (
    simResp &&
    simResp.netBalanceChanges &&
    simResp.netBalanceChanges.length
  ) {
    return simResp.netBalanceChanges.some((balChange: NetBalanceChange[]) => {
      return balChange.length && balChange.length > 0
    })
  }
  return false
}

export const patchProvider = (
  walletProvider: PatchedEIP1193Provider
): PatchedEIP1193Provider => {
  if (!walletProvider) {
    throw new Error(
      `An EIP 1193 wallet provider is required to preform patching and
      watch for transactions e.g. an injected wallet using window.ethereum`
    )
  }
  if (walletProvider.simPatched) return walletProvider as PatchedEIP1193Provider

  const fullProviderRequest = walletProvider.request
  const patchedProvider = walletProvider as PatchedEIP1193Provider
  const request: EIP1193Provider['request'] = async (req: {
    method: string
    params?: Array<unknown>
  }): Promise<any> => {
    if (
      req.method === 'eth_sendTransaction' &&
      req.params &&
      req.params.length
    ) {
      const transactionParams = req.params as TransactionForSim[]
      await handlePreview(transactionParams, fullProviderRequest, req)
    } else {
      return fullProviderRequest(req)
    }
  }
  try {
    patchedProvider.request = request
    patchedProvider.simPatched = true
  } catch (err) {
    console.error(
      `There was an error patching the passed in wallet provider.
      The provider may be read only and may be incompatible with Transaction Preview`
    )
  }
  return patchedProvider
}

const handlePreview = async (
  transaction: TransactionForSim[],
  fullProviderRequest?: PatchedEIP1193Provider['request'],
  req?: {
    method: string
    params?: Array<unknown>
  }
): Promise<void | unknown> => {
  try {
    if (!options) {
      throw new Error(
        `Please initialize Transaction Preview package prior to previewing a transaction.
         You can do this by calling the init function with the appropriate params`
      )
    }
    const preview = await simulateTransactions(options, transaction)
    if (!preview) {
      throw new Error(`An error ocurred while simulating the transaction, please 
      see the console for more details`)
    }
    if (preview.error.length) {
      fullProviderRequest(req)
      handleTPErrors(preview)
    }
    if (preview.status !== 'simulated' || !netBalanceChangesExist(preview)) {
      // If transaction simulation was unsuccessful or balanceChanges do
      // not exist do not create DOM el
      return fullProviderRequest(req)
    }
    if (app) app.$destroy()
    app = mountTransactionPreview(preview)
    options.requireTransactionApproval
      ? handleRequireApproval(app, fullProviderRequest, req)
      : fullProviderRequest(req)
          .then(() => {
            app.$destroy()
          })
          .catch(() => app.$destroy())
  } catch (e) {
    fullProviderRequest(req)
    if (app) app.$destroy()
    throw new Error(`${e}`)
  }
}

export const previewTransaction = async (
  transaction: TransactionForSim[]
): Promise<MultiSimOutput> => {
  try {
    if (!options) {
      throw new Error(
        `Please initialize Transaction Preview package prior to previewing a transaction.
         You can do this by calling the init function with the appropriate params`
      )
    }
    const preview = await simulateTransactions(options, transaction)
    if (!preview) {
      throw new Error(`An error ocurred while simulating the transaction, please 
      see the console for more details`)
    }
    if (preview.error.length) {
      handleTPErrors(preview)
    }
    if (preview.status !== 'simulated' || !netBalanceChangesExist(preview)) {
      // If transaction simulation was unsuccessful or balanceChanges do
      // not exist do not create DOM el
      console.error('No net balance changes ocurred from this simulation')
    }
    if (app) app.$destroy()
    app = mountTransactionPreview(preview)
    return preview
  } catch (e) {
    if (app) app.$destroy()
    throw new Error(`${e}`)
  }
}

const handleTPErrors = (preview: MultiSimOutput) => {
  let internalErrs = preview.internalTransactions.reduce(
    (acc: string[], tx: InternalTransaction[]) => {
      if (tx.length) {
        tx.forEach((t: InternalTransaction) => {
          if (t.errorReason) acc.push(t.errorReason)
        })
      }
      return acc
    },
    []
  )
  internalErrs = [...preview.error, ...internalErrs]
  throw new Error(
    `An error occurred during transaction simulation: ${internalErrs.join(
      ' - '
    )}`
  )
}

const transactionPreview: TransactionPreviewModule = (
  tpOptions: TransactionPreviewOptions
): TransactionPreviewAPI => {
  if (tpOptions) {
    const error = validateTPOptions(tpOptions)

    if (error) {
      throw error
    }
  }
  // defaults requireTransactionApproval to true
  optionalSettings = { requireTransactionApproval: true, ...tpOptions }

  initI18N((tpOptions && tpOptions.i18n) || {})

  return {
    patchProvider,
    init,
    previewTransaction
  }
}

const init = (initOptions: TransactionPreviewInitOptions): void => {
  if (initOptions) {
    const error = validateTPInit(initOptions)

    if (error) {
      throw error
    }
  }
  options = { ...initOptions, ...optionalSettings }
}

const fontFamilyExternallyDefined = (): boolean => {
  if (
    document.body &&
    (getComputedStyle(document.body).getPropertyValue('--w3o-font-family') ||
      getComputedStyle(document.body).getPropertyValue(
        '--onboard-font-family-normal'
      ))
  )
    return true
  return false
}

const importFontsToDoc = async (): Promise<void> => {
  const { InterVar } = await import('@web3-onboard/common')
  // Add Fonts to main page
  const styleEl = document.createElement('style')

  styleEl.innerHTML = `
    ${InterVar}
  `

  document.body.appendChild(styleEl)
}

const mountTransactionPreview = (simResponse: MultiSimOutput) => {
  class TransactionPreviewEl extends HTMLElement {
    constructor() {
      super()
    }
  }

  if (!customElements.get('transaction-preview')) {
    customElements.define('transaction-preview', TransactionPreviewEl)
  }

  if (!fontFamilyExternallyDefined()) {
    importFontsToDoc()
  }

  // add to DOM
  const transactionPreviewDomElement = document.createElement(
    'transaction-preview'
  )
  const target = transactionPreviewDomElement.attachShadow({ mode: 'open' })

  transactionPreviewDomElement.style.all = 'initial'

  const getW3OEl = document.querySelector('onboard-v2')

  const containerElementQuery = options.containerElement || 'body'

  let containerEl: Element | null

  // #w3o-transaction-preview-container is the container ID used by Onboard
  if (containerElementQuery !== '#w3o-transaction-preview-container') {
    containerEl = document.querySelector(containerElementQuery)
  } else {
    containerEl = getW3OEl.shadowRoot.querySelector(containerElementQuery)
  }

  if (!containerEl) {
    throw new Error(
      `Element with query ${containerElementQuery} does not exist.`
    )
  }

  containerEl.appendChild(transactionPreviewDomElement)
  const { requireTransactionApproval } = options

  const app = new TransactionPreview({
    target,
    intro: true,
    props: {
      simResponse,
      requireTransactionApproval,
      approved$,
      destroyApp
    }
  })

  return app
}

export default transactionPreview
