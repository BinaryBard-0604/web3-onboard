import { state } from './store/index.js'
import { getBalance } from './provider.js'
import { updateAllWallets } from './store/actions.js'
import { ethers } from 'ethers'
import { AccountAddress, Chain, weiToEth } from '@web3-onboard/common'
import type { SecondaryTokenBalances, WalletState } from './types'

async function updateBalances(addresses?: string[]): Promise<void> {
  const { wallets, chains } = state.get()
  const updatedWallets = await Promise.all(
    wallets.map(async wallet => {
      const chain = chains.find(({ id }) => id === wallet.chains[0].id)

      const updatedAccounts = await Promise.all(
        wallet.accounts.map(async account => {
          const secondaryTokens = await updateSecondaryTokens(
            wallet,
            account.address,
            chain
          )
          // if no provided addresses, we want to update all balances
          // otherwise check if address is in addresses array
          if (
            !addresses ||
            addresses.some(
              address => address.toLowerCase() === account.address.toLowerCase()
            )
          ) {
            const updatedBalance = await getBalance(account.address, chain)
            return { ...account, balance: updatedBalance, secondaryTokens }
          }
          return { ...account, secondaryTokens }
        })
      )
      return { ...wallet, accounts: updatedAccounts }
    })
  )
  updateAllWallets(updatedWallets)
}

export const updateSecondaryTokens = async (
  wallet: WalletState,
  account: AccountAddress,
  chain: Chain
): Promise<SecondaryTokenBalances[]> => {
  if (!chain) return
  const chainRPC = chain.rpcUrl
  if (!chain.secondaryTokens || !chain.secondaryTokens.length || !chainRPC)
    return

  const ethersProvider = new ethers.providers.Web3Provider(
    wallet.provider,
    'any'
  )
  const signer = ethersProvider.getSigner()

  const erc20ABISubset = [
    {
      inputs: [{ name: 'owner', type: 'address' }],
      name: 'balanceOf',
      outputs: [{ name: '', type: 'uint256' }],
      stateMutability: 'view',
      type: 'function'
    },
    {
      inputs: [],
      name: 'symbol',
      outputs: [{ name: '', type: 'string' }],
      stateMutability: 'view',
      type: 'function'
    }
  ]

  const tokenBalances = await Promise.all(
    chain.secondaryTokens.map(async token => {
      try {
        const swapContract = new ethers.Contract(
          token.address,
          erc20ABISubset,
          signer
        )
        const bigNumBalance = await swapContract.balanceOf(account)
        const tokenName = await swapContract.symbol()
        return {
          name: tokenName,
          balance: weiToEth(bigNumBalance.toHexString()),
          icon: token.icon
        }
      } catch (error) {
        console.error(
          `There was an error fetching balance and/or symbol 
          for token contract: ${token.address} - ${error}`
        )
      }
    })
  )
  return tokenBalances
}

export default updateBalances
