# Coinbase

Wallet module for connecting Coinbase Wallet SDK to web3-onboard. Check out the [Coinbase Wallet Developer Docs](https://docs.cloud.coinbase.com/wallet-sdk/docs) for more information.
## Install

<Tabs values={['yarn', 'npm']}>
<TabPanel value="yarn">

```sh copy
yarn add @web3-onboard/coinbase
```

  </TabPanel>
  <TabPanel value="npm">

```sh copy
npm install @web3-onboard/coinbase
```

  </TabPanel>
</Tabs>

## Options

```typescript
type CoinbaseWalletOptions = {
  darkMode: boolean // default = false
}
```

## Usage

```typescript
import Onboard from '@web3-onboard/core'
import coinbaseWalletModule from '@web3-onboard/coinbase'

// initialize the module with options
const coinbaseWalletSdk = coinbaseWalletModule({ darkMode: true })

// can also initialize with no options...
// const coinbaseWalletSdk = coinbaseWalletSdk()

const onboard = Onboard({
  // ... other Onboard options
  wallets: [
    coinbaseWalletSdk
    //... other wallets
  ]
})

const connectedWallets = await onboard.connectWallet()
console.log(connectedWallets)
```

## Build Environments
For build env configurations and setups please see the Build Env section [here](/docs/modules/core#build-environments)