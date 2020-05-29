[![NPM](https://nodei.co/npm/prettier-plugin-jsdoc.png)](https://nodei.co/npm/prettier-plugin-jsdoc/)

[![install size](https://packagephobia.now.sh/badge?p=prettier-plugin-jsdoc)](https://packagephobia.now.sh/result?p=prettier-plugin-jsdoc)
[![dependencies](https://david-dm.org/hosseinmd/prettier-plugin-jsdoc.svg)](https://david-dm.org/hosseinmd/prettier-plugin-jsdoc.svg)

# prettier-plugin-jsdoc

Prettier plugin for format jsdoc and convert to standard
Match with Visual studio and other IDE which support jsdoc.

Many good examples of how this plugin work, are in tests directory.
Compare tests and their snapshot

configured with best practices of jsDoc style guides

## TOC

- [Installation](#Installation)
- [Examples](#Examples)
- [Links](#Links)
- [Options](#Options)

## Installation

1. Install and configure Prettier as usual
2. Install prettier-plugin-jsdoc

```npm
npm i prettier-plugin-jsdoc --save
```

```yarn
yarn add prettier-plugin-jsdoc
```

3. Set "parser" value in Prettier options (.prettierrc etc) to "jsdoc-parser"

## Examples

#### Single line

```js
/**
 * @param {  string   }    param0 description
 */
function fun(param0) {}

/**
 * @type {React.FC<{   message:string}   >}
 */
const Component = memo(({ message }) => {
  return <p>{message}</p>;
});
```

Format to

```js
/** @param {string} param0 Description */
function fun(param0) {}

/** @type {React.FC<{message: string}>} */
const Component = memo(({ message }) => {
  return <p>{message}</p>;
});
```

#### Typescript Objects

```js
/**
 @typedef {
    {
        "userId": {
        title: string,
        "profileImageLink": *,
        "identityStatus": "None",
        "isBusinessUser": "isResellerUser"|"isBoolean"|  "isSubUser" |    "isNot",
        "shareCode": number,
        "referredBy": any,
        },
        id:number
      }
     } User
     */
```

Format to

```js
/**
 * @typedef {{
 *   userId: {
 *     title: string;
 *     profileImageLink: any;
 *     identityStatus: "None";
 *     isBusinessUser: "isResellerUser" | "isBoolean" | "isSubUser" | "isNot";
 *     shareCode: number;
 *     referredBy: any;
 *   };
 *   id: number;
 * }} User
 */
```

## Options

| Key                               | type    | Default |
| :-------------------------------- | :------ | :------ |
| jsdocSpaces                       | Number  | 1       |
| jsdocDescriptionWithDot           | Boolean | false   |
| jsdocDescriptionTag               | Boolean | false   |
| jsdocVerticalAlignment            | Boolean | false   |
| jsdocKeepUnParseAbleExampleIndent | Boolean | true    |

Full up to date list and description of options can be found in Prettier help. First install plugin then run Prettier with "--help" option.

`$ prettier --help` # global installation

`$ ./node_modules/.bin/prettier --help` # local installation

## Links

[Prettier](https://prettier.io)

[JSDoc](https://jsdoc.app)
