# Web3-Onboard

## Features

- **Minimal Dependencies**: All wallet dependencies are included in separate packages, so you only include the ones you want to use in your app.
- **Multiple Wallets and Accounts Connection**: Allow your users to connect multiple wallets and multiple accounts within each wallet at the same time to your app.
- **Multiple Chain Support**: Allow users to switch between chains/networks with ease.
- **Account Center**: A persistent interface to manage wallet connections and networks, with a minimal version for mobile
- **Notify**: Real-time transaction notifications for the connected wallet addresses for all transaction states
- **Wallet Provider Standardization**: All wallet modules expose a provider that is patched to be compliant with the [EIP-1193](https://eips.ethereum.org/EIPS/eip-1193), [EIP-1102](https://eips.ethereum.org/EIPS/eip-1102), [EIP-3085](https://eips.ethereum.org/EIPS/eip-3085) and [EIP-3326](https://ethereum-magicians.org/t/eip-3326-wallet-switchethereumchain/5471) specifications.
- **Dynamic Imports**: Supporting multiple wallets in your app requires a lot of dependencies. Onboard dynamically imports a wallet and its dependencies only when the user selects it, so that minimal bandwidth is used.

## Quickstart

Install the core Onboard library and the injected wallets module to support browser extension and mobile wallets:

`npm i @web3-onboard/core @web3-onboard/injected-wallets`

- [@web3-onboard/core Official NPM Documentation](https://www.npmjs.com/package/@web3-onboard/core)

Then initialize in your app:

```javascript
import Onboard from '@web3-onboard/core'
import injectedModule from '@web3-onboard/injected-wallets'

const MAINNET_RPC_URL = 'https://mainnet.infura.io/v3/<INFURA_KEY>'

const injected = injectedModule()

const onboard = Onboard({
  wallets: [injected],
  chains: [
    {
      id: '0x1',
      token: 'ETH',
      label: 'Ethereum Mainnet',
      rpcUrl: MAINNET_RPC_URL
    }
  ],
  appMetadata: {
    name: 'My App',
    icon: '<SVG_ICON_STRING>',
    description: 'My app using Onboard'
  }
})

const wallets = await onboard.connectWallet()

console.log(wallets)
```

## Documentation

For full documentation, check out the README.md for each package:

**Core Repo**

- [Core](packages/core/README.md)

**Injected Wallets**

- [Injected](packages/injected/README.md)

**SDK Wallets**

- [Fortmatic](packages/fortmatic/README.md)
- [Gnosis](packages/gnosis/README.md)
- [MEW](packages/mew/README.md)
- [Portis](packages/portis/README.md)
- [Torus](packages/torus/README.md)
- [WalletConnect](packages/walletconnect/README.md)
- [WalletLink](packages/walletlink/README.md)
- Magic (in active development)

**Hardware Wallets**

- [KeepKey](packages/keepkey/README.md)
- [Ledger](packages/ledger/README.md)
- [Trezor](packages/trezor/README.md)
- [Keystone](packages/keystone/README.md)
- [D'CENT](packages/dcent/README.md)
**Frameworks**

- [React](packages/react/README.md)
- [Vue](packages/vue/README.md)

## Test out the demo app

If you would like to test out the current functionality of V2 in a small browser demo, then:

- Clone the repo: `git clone git@github.com:blocknative/onboard.git`
- Change in to the onboard directory: `cd onboard`
- Checkout the V2 feature branch: `git checkout v2-web3-onboard`
- Install the dependencies: `yarn` (if running a M1 mac - `yarn install-m1-mac`)
- Run all packages in dev mode: `yarn dev`
- [View demo app in the browser](http://localhost:8080)
