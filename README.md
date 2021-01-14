[![NPM](https://nodei.co/npm/prettier-plugin-jsdoc.png)](https://nodei.co/npm/prettier-plugin-jsdoc/)

[![install size](https://packagephobia.now.sh/badge?p=prettier-plugin-jsdoc)](https://packagephobia.now.sh/result?p=prettier-plugin-jsdoc)
[![dependencies](https://david-dm.org/hosseinmd/prettier-plugin-jsdoc.svg)](https://david-dm.org/hosseinmd/prettier-plugin-jsdoc.svg)

![Prettier Banner](https://raw.githubusercontent.com/prettier/prettier-logo/master/images/prettier-banner-light.png)

# prettier-plugin-jsdoc

Prettier plugin for format comment blocks and convert to standard
Match with Visual studio and other IDE which support jsdoc and comments as markdown.

Many good examples of how this plugin work, are in tests directory.
Compare tests and their snapshot

Configured with best practices of jsDoc style guides.

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

## Config

.prettierrc

```json
{
  //any other config you have
  "jsdocParser": true, // default is true, format all javascript and typescript files
};
```

If you want ignore some type of files set jsdocParser to false

```.prettierrc.js
module.exports = {
  // any other config you have
  overrides: [
    {
      files: '*.tsx',
      options: {
        jsdocParser: false
      },
    },
  ],
};
```

## Examples

#### Single line

```js
/**
 * @param {  string   }    param0 description
 */
function fun(param0) {}
```

Format to

```js
/** @param {string} param0 Description */
function fun(param0) {}
```

#### React Component

```js
/**
 * @type {React.FC<{   message:string}   >}
 */
const Component = memo(({ message }) => {
  return <p>{message}</p>;
});
```

Format to

```js
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
        "profileImageLink": *,
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
 *     profileImageLink: any;
 *     isBusinessUser: "isResellerUser" | "isBoolean" | "isSubUser" | "isNot";
 *     shareCode: number;
 *     referredBy: any;
 *   };
 *   id: number;
 * }} User
 */
```

#### Example

Add code to example tag

```js
/**
 * @examples
 *   var one= 5
 *   var two=10
 *
 *   if(one > 2) { two += one }
 */
```

to

```js
/**
 * @example
 *   var one = 5;
 *   var two = 10;
 *
 *   if (one > 2) {
 *     two += one;
 *   }
 */
```

#### Description

Description is formatting as Markdown, so you could use any features of Markdown on that. Like code tags ("```js"), header tags like "# AHeader" or other markdown features.
## Options

| Key                               | type    | Default |
| :-------------------------------- | :------ | :------ |
| jsdocParser                       | Boolean | true    |
| jsdocSpaces                       | Number  | 1       |
| jsdocDescriptionWithDot           | Boolean | false   |
| jsdocDescriptionTag               | Boolean | false   |
| jsdocVerticalAlignment            | Boolean | false   |
| jsdocKeepUnParseAbleExampleIndent | Boolean | true    |

Full up to date list and description of options can be found in Prettier help. First install plugin then run Prettier with "--help" option.

`$ prettier --help` # global installation

`$ ./node_modules/.bin/prettier --help` # local installation

## ESLint

Install [eslint-plugin-prettier](https://github.com/prettier/eslint-plugin-prettier)

```
$ yarn add eslint eslint-plugin-prettier
```

Then, in your .eslintrc.json:

```json
{
  "plugins": ["prettier"],
  "rules": {
    "prettier/prettier": "error"
  }
}
```

## Contribute

1- Get a clone/fork of repo

2- Install yarn

3- Add your changes

4- Add a test to your change if needed

5- Create PR

This project extended from @gum3n worked project on GitLab.

## Links

[Prettier](https://prettier.io)

[JSDoc](https://jsdoc.app)
