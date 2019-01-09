`webpack-bulma-variants-to-sass-loader`
====

Webpack loader to export typings as `BEM` convention.
This is enriching `typings-for-css-modules-loader` and override typings file to file like below. It is adding extra info about `block`, `modifiers` and `elements`. It is required to combine components with typings in any directions and apply overlay layer to augment "Cascading"CS behaviour.

### Examples
#### Exporting `navbar` to BEM
```ts
{
  "block": [
    "navbar",
  ],
  "elements": [
    "navbarLink",
    "navbarItem",
    "navbarDropdown",
  ],
  "modifiers": [
    "isArrowless",
    "hasDropdown",
  ],
  "others": [
    "spinAround",
    "dataItem",
  ],
}
```

#### Exported file
```ts
export const button: string;
export const isLoading: string;
export const spinAround: string;
export const isFocused: string;
export const isActive: string;
export const icon: string;
export const isSmall: string;
export const isMedium: string;
export const isLarge: string;
export const isHovered: string;
export const isText: string;
export const isWhite: string;
export const isInverted: string;
export const isOutlined: string;
export const isBlack: string;
export const isLight: string;
export const isDark: string;
export const isPrimary: string;
export const isLink: string;
export const isInfo: string;
export const isSuccess: string;
export const isWarning: string;
export const isDanger: string;
export const isFullwidth: string;
export const isStatic: string;
export const isRounded: string;
export const buttons: string;
export const hasAddons: string;
export const isSelected: string;
export const isExpanded: string;
export const isCentered: string;
export const isRight: string;

export type Block = "button" | "icon" | "buttons"
export type Modifiers = "isLoading" | "isFocused" | "isActive" | "isSmall" | "isMedium" | "isLarge" | "isHovered" | "isText" | "isWhite" | "isInverted" | "isOutlined" | "isBlack" | "isLight" | "isDark" | "isPrimary" | "isLink" | "isInfo" | "isSuccess" | "isWarning" | "isDanger" | "isFullwidth" | "isStatic" | "isRounded" | "hasAddons" | "isSelected" | "isExpanded" | "isCentered" | "isRight"
export type Others = "spinAround"
export type All = Block | Modifiers | Others
export type BEM = Record<All, boolean>
declare let module: Record<All, string>
export default module
```

### component implementation
```ts
import {
  styledWithVariants,
  toStyledGenericFromStringOrJSX,
  div
} from '@hungry/sassy-react-component'

import { combineCSSWithModifiers, WithModifiers } from './modifiers'

import CSS, { BEM } from './Notification.sass'

const asBulmaVariant =
  styledWithVariants<WithModifiers<BEM>>(
    combineCSSWithModifiers(CSS))

const Block =
  asBulmaVariant('notification')
    (div)

const DeleteButton =
  asBulmaVariant('button', 'isDelete', 'delete')
    (toStyledGenericFromStringOrJSX('button'))

const Title =
  asBulmaVariant('title')
    (div)

const Subtitle =
  asBulmaVariant('subtitle')
    (div)

const Content =
  asBulmaVariant('content')
    (div)

export const Notification = {
  Block,
  DeleteButton,
  Title,
  Subtitle,
  Content
}
```