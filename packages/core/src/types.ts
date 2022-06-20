import type { SvelteComponent } from 'svelte'

import type {
  AppMetadata,
  Device,
  WalletInit,
  EIP1193Provider,
  WalletModule,
  Chain,
  TokenSymbol
} from '@web3-onboard/common'

import type setChain from './chain'
import type connect from './connect'
import type disconnect from './disconnect'
import type { state } from './store'
import type en from './i18n/en.json'
import type { EthereumTransactionData, Network } from 'bnc-sdk'

export interface InitOptions {
  /**
   * Wallet modules to be initialized and added to wallet selection modal
   */
  wallets: WalletInit[]
  /**
   * The chains that your app works with
   */
  chains: Chain[]
  /**
   * Additional metadata about your app to be displayed in the Onboard UI
   */
  appMetadata?: AppMetadata
  /**
   * Define custom copy for the 'en' locale or add locales to i18n your app
   */
  i18n?: i18nOptions
  /**
   * Customize the account center UI
   */
  accountCenter?: AccountCenterOptions
  /**
   * Opt in to Blocknative value add services (transaction updates) by providing
   * your Blocknative API key, head to https://explorer.blocknative.com/account
   */
  apiKey?: string
  /**
   * Transaction notification options
   */
  notify?: Partial<NotifyOptions>
}

export interface OnboardAPI {
  connectWallet: typeof connect
  disconnectWallet: typeof disconnect
  setChain: typeof setChain
  state: typeof state
}
export interface ConnectOptions {
  autoSelect?: { label: string; disableModals: boolean }
}

export interface ConnectOptionsString {
  autoSelect?: string
}

export interface DisconnectOptions {
  label: string // wallet name to disconnect
}

export interface WalletWithLoadedIcon extends Omit<WalletModule, 'getIcon'> {
  icon: string
}

export interface WalletWithLoadingIcon
  extends Omit<WalletWithLoadedIcon, 'icon'> {
  icon: Promise<string>
}

export type ConnectedChain = {
  id: Chain['id']
  namespace: Chain['namespace']
}

export interface WalletState {
  label: string //  wallet name
  icon: string // wallet icon svg string
  provider: EIP1193Provider
  accounts: Account[]
  // in future it will be possible that a wallet
  // is connected to multiple chains at once
  chains: ConnectedChain[]
  instance?: unknown
}

export type Account = {
  address: Address
  ens: Ens | null
  balance: Balances | null
}

export type Balances = Record<TokenSymbol, string> | null

export interface Ens {
  name: string
  avatar: Avatar | null
  contentHash: string | null
  getText: (key: string) => Promise<string | undefined>
}

export type Avatar = {
  url: string
  linkage: Array<{ type: string; content: string }>
}

export type Address = string

export interface AppState {
  chains: Chain[]
  walletModules: WalletModule[]
  wallets: WalletState[]
  accountCenter: AccountCenter
  locale: Locale
  notify: NotifyOptions
  notifications: Notification[]
}

export type Configuration = {
  svelteInstance: SvelteComponent | null
  appMetadata: AppMetadata | null
  device: Device | DeviceNotBrowser
  apiKey: string
}

export type Locale = string
export type i18nOptions = Record<Locale, i18n>
export type i18n = typeof en

export type AccountCenterPosition =
  | 'topRight'
  | 'bottomRight'
  | 'bottomLeft'
  | 'topLeft'

export type AccountCenter = {
  enabled: boolean
  position?: AccountCenterPosition
  expanded?: boolean
  minimal?: boolean
}

export type AccountCenterOptions = {
  desktop: Omit<AccountCenter, 'expanded'>
  mobile: Omit<AccountCenter, 'expanded'>
}

export type NotifyOptions = {
  /**
   * Defines whether whether to subscribe to transaction events or not
   * default: true
   */
  enabled: boolean
  /**
   * Callback that receives all transaction events
   * Return a custom notification based on the event
   * Or return false to disable notification for this event
   * Or return undefined for a default notification
   */
  transactionHandler: (
    event: EthereumTransactionData
  ) => TransactionHandlerReturn
}

export type Notification = {
  id: string
  key: string
  type: NotificationType
  network: Network
  startTime?: number
  eventCode: string
  message: string
  autoDismiss: number
  link?: string
  onclick?: (event: Event) => void
}

export type TransactionHandlerReturn = CustomNotification | boolean | void

export type CustomNotification = Partial<
  Omit<Notification, 'startTime' | 'network' | 'id' | 'key'>
>

export type CustomNotificationUpdate = Partial<
  Omit<Notification, 'startTime' | 'network'>
>

export type NotificationType = 'pending' | 'success' | 'error' | 'hint'

export interface UpdateNotification {
  (notificationObject: CustomNotification): {
    dismiss: () => void
    update: UpdateNotification
  }
}

// ==== ACTIONS ==== //
export type Action =
  | AddChainsAction
  | AddWalletAction
  | UpdateWalletAction
  | RemoveWalletAction
  | ResetStoreAction
  | UpdateAccountAction
  | UpdateAccountCenterAction
  | SetWalletModulesAction
  | SetLocaleAction
  | UpdateNotifyAction
  | AddNotificationAction
  | RemoveNotificationAction
  | UpdateAllWalletsAction

export type AddChainsAction = { type: 'add_chains'; payload: Chain[] }
export type AddWalletAction = { type: 'add_wallet'; payload: WalletState }

export type UpdateWalletAction = {
  type: 'update_wallet'
  payload: { id: string } & Partial<WalletState>
}

export type RemoveWalletAction = {
  type: 'remove_wallet'
  payload: { id: string }
}

export type ResetStoreAction = {
  type: 'reset_store'
  payload: unknown
}

export type UpdateAccountAction = {
  type: 'update_account'
  payload: { id: string; address: string } & Partial<Account>
}

export type UpdateAccountCenterAction = {
  type: 'update_account_center'
  payload: AccountCenter | Partial<AccountCenter>
}

export type SetWalletModulesAction = {
  type: 'set_wallet_modules'
  payload: WalletModule[]
}

export type SetLocaleAction = {
  type: 'set_locale'
  payload: string
}

export type UpdateNotifyAction = {
  type: 'update_notify'
  payload: Partial<NotifyOptions>
}

export type AddNotificationAction = {
  type: 'add_notification'
  payload: Notification
}

export type RemoveNotificationAction = {
  type: 'remove_notification'
  payload: Notification['id']
}

export type UpdateAllWalletsAction = {
  type: 'update_balance'
  payload: WalletState[]
}

// ==== MISC ==== //
export type ChainStyle = {
  icon: string
  color: string
}

export type NotifyEventStyles = {
  backgroundColor: string
  borderColor: string
  eventIcon: string
  iconColor?: string
}

export type DeviceNotBrowser = {
  type: null
  os: null
  browser: null
}
