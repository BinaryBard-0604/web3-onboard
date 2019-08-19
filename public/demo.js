import selectWallet from "./bn-select-wallet"
import prepareWallet from "./bn-prepare-wallet"
import Onboard from "./Onboard"

const onboard = Onboard.init({
  dappId: "12153f55-f29e-4f11-aa07-90f10da5d778",
  networkId: 4,
  subscriptions: {
    address: a => {
      const address = document.getElementById("address")
      if (address) {
        address.innerHTML = a || ""
      }
    },
    network: n => {
      const network = document.getElementById("network")
      if (network) {
        network.innerHTML = n || ""
      }
    },
    balance: b => {
      const balance = document.getElementById("balance")
      if (balance) {
        balance.innerHTML = (b && b / 1000000000000000000 + " ETH") || ""
      }
    },
    provider: p => console.log("provider:", p)
  },
  modules: {
    selectWallet: selectWallet({
      fortmatic: { apiKey: "pk_test_886ADCAB855632AA" },
      trezor: {
        email: "aaron@flexdapps.com",
        appUrl: "https://flexdapps.com",
        apiKey: "d5e29c9b9a9d4116a7348113f57770a8"
      },
      networkId: 4
    }),
    prepareWallet: prepareWallet({
      networkId: 4,
      minimumBalance: "900000000000000000"
    }),
    networkId: 4
  }
})

window.onboard = onboard
