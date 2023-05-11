---
title: Theming
---

# {$frontmatter.title}

To customize the color theme of web3-onboard and match it with your dapp, you can choose from the available native themes ('default', 'dark', 'light', 'system') or create a custom theme using a `ThemingMap` object and our [Theming Tool walkthrough](#theming-tool).

## Available Themes

To set the color theme of web3-onboard to one of the available native themes, import Onboard from `@web3-onboard/core` and pass the theme as a string to the `theme` init option.

| theme     | description                                                                       |
| --------- | --------------------------------------------------------------------------------- |
| 'default' | default theme                                                                     |
| 'dark'    | dark mode                                                                         |
| 'light'   | light mode                                                                        |
| 'system'  | automatically switch between 'dark' & 'light' based on the user's system settings |

Example:

```typescript
import Onboard from '@web3-onboard/core'

const onboard = Onboard({
  theme: 'dark'
  // other options like wallets, chains, appMetaData, etc.
})
```

---

## Variables

In the table below, you'll find a list of css variables that you can use to theme web3-onboard.

| variable               | description       |
| ---------------------- | ----------------- |
| --w3o-background-color | background color  |
| --w3o-foreground-color | foreground color  |
| --w3o-text-color       | text color        |
| --w3o-border-color     | border color      |
| --w3o-action-color     | buttons and links |
| --w3o-border-radius    | border radius     |

---

## Custom Theme

To create a custom theme, you can define a `ThemingMap` object with CSS variables for different components of web3-onboard. Pass this object as the theme option.

```typescript copy
import Onboard, { ThemingMap } from '@web3-onboard/core'

const customTheme: ThemingMap = {
  '--w3o-background-color': '#f0f0f0',
  '--w3o-foreground-color': '#333',
  '--w3o-text-color': '#fff',
  '--w3o-border-color': '#ccc',
  '--w3o-action-color': '#007bff',
  '--w3o-border-radius': '5px'
}

const onboard = Onboard({
  theme: customTheme
  // other options like wallets, chains, appMetaData, etc.
})
```

---

## Dynamically Update Theme with API

**`updateTheme`** is an exposed API method for actively updating the theme of web3-onboard. The function accepts `Theme` types (see below).
_If using the `@web3-onboard/react` package there is a hook exposed called `updateTheme`_

The function also accepts a custom built `ThemingMap` object that contains all or some of the theming variables

Example:

```typescript copy
import Onboard from '@web3-onboard/core'

const onboard = Onboard({
  theme: 'dark'
  // other options like wallets, chains, appMetaData, etc.
})

// after initialization you may want to change the theme based on UI state
onboard.state.actions.updateTheme('light')

// or

const customTheme: ThemingMap = {
  '--w3o-background-color': '#f0f0f0',
  '--w3o-foreground-color': '#333',
  '--w3o-text-color': '#fff',
  '--w3o-border-color': '#ccc',
  '--w3o-action-color': '#007bff'
}
onboard.state.actions.updateTheme(customTheme)
```

#### Theme Types

```typescript
export type Theme = ThemingMap | BuiltInThemes | 'system'

export type BuiltInThemes = 'default' | 'dark' | 'light'

export type ThemingMap = {
  '--w3o-background-color'?: string
  '--w3o-foreground-color'?: string
  '--w3o-text-color'?: string
  '--w3o-border-color'?: string
  '--w3o-action-color'?: string
  '--w3o-border-radius'?: string
}
```

---

## Theming Tool

You can preview how web3-onboard will look on your site by using our [theming tool](/theming-tool) to customize the look and feel of web3-onboard. You can try different themes or create your own and preview the result by entering a URL or adding a screenshot.

To do this:

- Head over to our [theming tool](/theming-tool)
- Drop a screen shot or enter the URL of your site
- Switch between the built in themes using the control panel in the lower left corner
- To customize, select 'custom' and click the different circles to change the color
- Copy the output theme and use as the value to the `theme` prop within the onboard config **or** within the `updateTheme` API action ([see API action](#dynamically-update-theme-with-api))
  :::admonition type="tip"
  _Pro tip: use the toggle to disable the backdrop and select the eye dropper after clicking a color circle to match the color of your site perfectly_
  :::

#### Follow along with the video below:

<iframe width="620" height="420" src="https://www.youtube.com/embed/UsBdlQpb_kA" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

:::admonition type="warning"
_note: not all sites allow iframe injection, if this is the case for your site use a screenshot_
:::
