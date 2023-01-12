# Walletlink

:::admonition type=warning
_Wallet module for connecting WalletLink to web3-onboard is now deprecated. Please use [@web3-onboard/coinbase](./coinbase.md)_
:::

### Install

<Tabs values={['yarn', 'npm']}>
<TabPanel value="yarn">

```sh copy
yarn add @web3-onboard/walletlink
```

  </TabPanel>
  <TabPanel value="npm">

```sh copy
npm install @web3-onboard/walletlink
```

  </TabPanel>
</Tabs>

## Options

```typescript
type WalletLinkOptions = {
  darkMode: boolean // default = false
}
```

## Usage

```typescript
import Onboard from '@web3-onboard/core'
import walletLinkModule from '@web3-onboard/walletlink'

// initialize the module with options
const walletLink = walletLinkModule({ darkMode: true })

// can also initialize with no options...
// const walletLink = walletLinkModule()

const onboard = Onboard({
  // ... other Onboard options
  wallets: [
    walletLink
    //... other wallets
  ]
})

const connectedWallets = await onboard.connectWallet()
console.log(connectedWallets)
```
