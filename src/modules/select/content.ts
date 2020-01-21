export const extensionInstallMessage = (helpers: {
  currentWallet: string | undefined
  selectedWallet: string
}) => {
  const { currentWallet, selectedWallet } = helpers

  if (currentWallet) {
    return `
    <p style="font-size: 0.889rem; font-family: inherit; margin: 0.889rem 0;">
    We have detected that you already have
    <b>${currentWallet}</b>
    installed. If you would prefer to use
    <b>${selectedWallet}</b>
    instead, then click below to install.
    </p>
    <p style="font-size: 0.889rem; font-family: inherit; margin: 0.889rem 0;">
    <b>Tip:</b>
    If you already have ${selectedWallet} installed, check your
    browser extension settings to make sure that you have it enabled
    and that you have disabled any other browser extension wallets.
    <span
      class="bn-onboard-clickable"
      style="color: #4a90e2; font-size: 0.889rem; font-family: inherit;"
      onclick="window.location.reload();">
      Then refresh the page.
    </span>
    </p>
    `
  } else {
    return `
    <p style="font-size: 0.889rem; font-family: inherit; margin: 0.889rem 0;">
    You'll need to install <b>${selectedWallet}</b> to continue. Once you have it installed, go ahead and
    <span
    class="bn-clickable"
      style="color: #4a90e2; font-size: 0.889rem; font-family: inherit;"
      onclick={window.location.reload();}>
      refresh the page.
    </span>
    </p>
    `
  }
}

export const mobileWalletInstallMessage = (helpers: {
  selectedWallet: string
}) => {
  const { selectedWallet } = helpers

  return `
  <p style="font-size: 0.889rem;">
    You'll need to install <b>${selectedWallet}</b> to continue. Click below to install and then load this Dapp with <b>${selectedWallet}</b>.
  </p>
  `
}
