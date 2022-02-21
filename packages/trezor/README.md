# @web3-onboard/trezor

## Wallet module for connecting Trezor hardware wallets to web3-onboard

### Install

`npm i @web3-onboard/trezor`

### Options

```typescript
type TrezorOptions = {
  email: string
  appUrl: string
  customNetwork?: CustomNetwork
}

interface CustomNetwork {
  networkId: number
  genesis: GenesisBlock
  hardforks: Hardfork[]
  bootstrapNodes: BootstrapNode[]
}

interface GenesisBlock {
  hash: string
  timestamp: string | null
  gasLimit: number
  difficulty: number
  nonce: string
  extraData: string
  stateRoot: string
}

interface Hardfork {
  name: string
  block: number | null
}

interface BootstrapNode {
  ip: string
  port: number | string
  network?: string
  chainId?: number
  id: string
  location: string
  comment: string
}
```

### Usage

```typescript
import Onboard from '@web3-onboard/core'
import trezorModule from '@web3-onboard/trezor'

const trezor = trezorModule({
  email: '<EMAIL_CONTACT>',
  appUrl: '<APP_URL>'
})

const onboard = Onboard({
  // ... other Onboard options
  wallets: [
    trezor
    //... other wallets
  ]
})

const connectedWallets = await onboard.connectWallet()
console.log(connectedWallets)
```
