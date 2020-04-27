[![NPM](https://nodei.co/npm/prettier-plugin-jsdoc.png)](https://nodei.co/npm/prettier-plugin-jsdoc/)

[![install size](https://packagephobia.now.sh/badge?p=prettier-plugin-jsdoc)](https://packagephobia.now.sh/result?p=prettier-plugin-jsdoc)
[![dependencies](https://david-dm.org/hosseinmd/prettier-plugin-jsdoc.svg)](https://david-dm.org/hosseinmd/prettier-plugin-jsdoc.svg)

# prettier-plugin-jsdoc

Prettier plugin for format jsdoc and convert to standard
Match with Visual studio and other IDE which support jsdoc

## TOC

- [Installation](#Installation)
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
