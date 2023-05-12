---
title: Custom Styling
---

# {$frontmatter.title}

You can customize web3-onboard to match the look and feel of your dapp. web3-onboard exposes css variables for each of its UI components.

Interested in seeing how web3-onboard will look on your site?

[Try out our theming tool](/theming-tool)

It will allow you to customize the look and feel of web3-onboard, try different themes or create your own, and preview how web3-onboard will look on your site by entering a URL or adding a screenshot.

## CSS custom properties (variables)

The Onboard styles can customized via [CSS custom properties](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties). The following properties and their default properties can be customized by adding these variables to the `:root` in your CSS file:

```css
:root {
  /* CUSTOMIZE THE COLOR  PALETTE */
  --onboard-white: white;
  --onboard-black: black;
  --onboard-primary-1: #2f80ed;
  --onboard-primary-100: #eff1fc;
  --onboard-primary-200: #d0d4f7;
  --onboard-primary-300: #b1b8f2;
  --onboard-primary-400: #929bed;
  --onboard-primary-500: #6370e5;
  --onboard-primary-600: #454ea0;
  --onboard-primary-700: #323873;
  --onboard-gray-100: #ebebed;
  --onboard-gray-200: #c2c4c9;
  --onboard-gray-300: #999ca5;
  --onboard-gray-400: #707481;
  --onboard-gray-500: #33394b;
  --onboard-gray-600: #242835;
  --onboard-gray-700: #1a1d26;
  --onboard-success-100: #d1fae3;
  --onboard-success-200: #baf7d5;
  --onboard-success-300: #a4f4c6;
  --onboard-success-400: #8df2b8;
  --onboard-success-500: #5aec99;
  --onboard-success-600: #18ce66;
  --onboard-success-700: #129b4d;
  --onboard-danger-100: #ffe5e6;
  --onboard-danger-200: #ffcccc;
  --onboard-danger-300: #ffb3b3;
  --onboard-danger-400: #ff8080;
  --onboard-danger-500: #ff4f4f;
  --onboard-danger-600: #cc0000;
  --onboard-danger-700: #660000;
  --onboard-warning-100: #ffefcc;
  --onboard-warning-200: #ffe7b3;
  --onboard-warning-300: #ffd780;
  --onboard-warning-400: #ffc74c;
  --onboard-warning-500: #ffaf00;
  --onboard-warning-600: #cc8c00;
  --onboard-warning-700: #664600;

  /* CUSTOMIZE ACCOUNT CENTER*/
  --account-center-z-index
  --account-center-position-top
  --account-center-position-bottom
  --account-center-position-right
  --account-center-position-left
  --account-center-minimized-background
  --account-center-maximized-upper-background
  --account-center-maximized-network-section
  --account-center-maximized-app-info-section
  --account-center-minimized-address-color
  --account-center-maximized-address-color
  --account-center-maximized-account-section-background-hover
  --account-center-maximized-action-background-hover
  --account-center-minimized-chain-select-background
  --account-center-network-selector-color
  --account-center-maximized-network-selector-color
  --account-center-minimized-network-selector-color
  --account-center-app-btn-text-color
  --account-center-app-btn-background
  --account-center-app-btn-font-family
  --account-center-border
  --account-center-box-shadow
  --account-center-border-radius
  --account-center-chain-warning
  --account-center-minimized-balance-color
  --account-center-minimized-chain-select-background
  --account-center-maximized-network-section-background
  --account-center-maximized-network-text-color
  --account-center-maximized-info-section-background-color
  --account-center-maximized-upper-action-color
  --account-center-maximized-upper-action-background-hover
  --account-center-maximized-app-name-color
  --account-center-maximized-app-info-color
  --account-center-micro-background

  /* CUSTOMIZE SECTIONS OF THE CONNECT MODAL */
  --onboard-connect-content-width
  --onboard-connect-content-height
  --onboard-wallet-columns
  --onboard-connect-sidebar-background
  --onboard-connect-sidebar-color
  --onboard-connect-sidebar-progress-background
  --onboard-connect-sidebar-progress-color
  --onboard-connect-header-background
  --onboard-connect-header-color
  --onboard-main-scroll-container-background
  --onboard-link-color
  --onboard-close-button-background
  --onboard-close-button-color
  --onboard-checkbox-background
  --onboard-checkbox-color
  --onboard-wallet-button-background
  --onboard-wallet-button-background-hover
  --onboard-wallet-button-color
  --onboard-wallet-button-border-color
  --onboard-wallet-button-border-radius
  --onboard-wallet-button-box-shadow
  --onboard-wallet-app-icon-border-color

  /* CUSTOMIZE THE SHARED MODAL */
  --onboard-modal-background
  --onboard-modal-color

  /* CUSTOMIZE THE CONNECT MODAL */
  --onboard-modal-border-radius
  --onboard-modal-backdrop
  --onboard-modal-box-shadow

  /* CUSTOMIZE THE ACTION REQUIRED MODAL */
  --onboard-action-required-modal-background

  /* FONTS */
  --onboard-font-family-normal:  Inter, sans-serif;

  --onboard-font-size-1: 3rem;
  --onboard-font-size-2: 2.25rem;
  --onboard-font-size-3: 1.5rem;
  --onboard-font-size-4: 1.25rem;
  --onboard-font-size-5: 1rem;
  --onboard-font-size-6: 0.875rem;
  --onboard-font-size-7: 0.75rem;

  /* SPACING */
  --onboard-spacing-1: 3rem;
  --onboard-spacing-2: 2rem;
  --onboard-spacing-3: 1.5rem;
  --onboard-spacing-4: 1rem;
  --onboard-spacing-5: 0.5rem;

  /* BORDER RADIUS */
  --onboard-border-radius-1: 24px;
  --onboard-border-radius-2: 20px;
  --onboard-border-radius-3: 16px;

  /* SHADOWS */
  --onboard-shadow-0: none;
  --onboard-shadow-1: 0px 4px 12px rgba(0, 0, 0, 0.1);
  --onboard-shadow-2: inset 0px -1px 0px rgba(0, 0, 0, 0.1);

  /* MAIN MODAL POSITIONING */
  --onboard-modal-z-index
  --onboard-modal-top
  --onboard-modal-bottom
  --onboard-modal-right
  --onboard-modal-left

  /* HD WALLET ACCOUNT SELECT MODAL POSITIONING */
  --onboard-account-select-modal-z-index
  --onboard-account-select-modal-top
  --onboard-account-select-modal-bottom
  --onboard-account-select-modal-right
  --onboard-account-select-modal-left

  /* MAGIC WALLET MODAL POSITIONING */
  --onboard-login-modal-z-index
  --onboard-login-modal-top
  --onboard-login-modal-bottom
  --onboard-login-modal-right
  --onboard-login-modal-left


  /* HARDWARE WALLET STYLES  */
  /* *if not set will fallback to variables with `--onboard` prefix shown above */

  /* COLORS */
  --account-select-modal-white: white;
  --account-select-modal-black: black;
  --account-select-modal-primary-100: #eff1fc;
  --account-select-modal-primary-200: #d0d4f7;
  --account-select-modal-primary-300: #b1b8f2;
  --account-select-modal-primary-500: #6370e5;
  --account-select-modal-primary-600: #454ea0;
  --account-select-modal-gray-100: #ebebed;
  --account-select-modal-gray-200: #c2c4c9;
  --account-select-modal-gray-300: #999ca5;
  --account-select-modal-gray-500: #33394b;
  --account-select-modal-gray-700: #1a1d26;
  --account-select-modal-danger-500: #ff4f4f;

  /* FONTS */
  --account-select-modal-font-family-normal:  Inter, sans-serif;
  --account-select-modal-font-size-5: 1rem;
  --account-select-modal-font-size-7: .75rem;
  --account-select-modal-font-line-height-1: 24px;

  /* SPACING */
  --account-select-modal-margin-4: 1rem;
  --account-select-modal-margin-5: 0.5rem;

  /* NOTIFY STYLES */
  /* Notify Positioning variables only take effect if Notify is Positioned separate of Account Center */
  --notify-onboard-container-position-top
  --notify-onboard-container-position-bottom
  --notify-onboard-container-position-right
  --notify-onboard-container-position-left
  --notify-onboard-font-family-normal
  --notify-onboard-font-size-5
  --notify-onboard-gray-300
  --notify-onboard-gray-600
  --notify-onboard-border-radius
  --notify-onboard-font-size-7
  --notify-onboard-font-size-6
  --notify-onboard-line-height-4
  --notify-onboard-primary-100
  --notify-onboard-primary-400
  --notify-onboard-main-padding
  --notify-onboard-z-index
  --notify-onboard-background
  --notify-onboard-close-icon-color
  --notify-onboard-close-icon-hover
  --notify-onboard-transaction-status-color
  --notify-onboard-transaction-font-size
  --notify-onboard-hash-time-font-size
  --notify-onboard-hash-time-font-line-height
  --notify-onboard-address-hash-color
  --notify-onboard-anchor-color
}
```
