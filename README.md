[![NPM](https://nodei.co/npm/prettier-plugin-jsdoc.png)](https://nodei.co/npm/prettier-plugin-jsdoc/)

[![Installation size](https://packagephobia.now.sh/badge?p=prettier-plugin-jsdoc)](https://packagephobia.now.sh/result?p=prettier-plugin-jsdoc)

# prettier-plugin-jsdoc

Prettier plugin for formatting comment blocks and converting to a standard.
Match with Visual Studio Code and other IDEs that support JSDoc and comments as Markdown.

Many good examples of how this plugin works are in the [`/tests`](/tests) directory.
Compare tests and their [snapshots](/tests//__snapshots__).

Configured with best practices of JSDoc style guides.

## Contents

- [Installation](#installation)
- [Configuration](#configuration)
- [Ignore](#ignore)
- [Examples](#examples)
- [Options](#options)
- [Supported Prettier versions](#supported-prettier-versions)
- [Contributing](#contributing)
- [Links](#links)
- [Acknowledge](#acknowledge)

## Installation

1. [Install](https://prettier.io/docs/en/install.html) and [configure](https://prettier.io/docs/en/configuration) Prettier
2. Install `prettier-plugin-jsdoc`:

```sh
npm install prettier-plugin-jsdoc --save-dev
```

```sh
yarn add prettier-plugin-jsdoc --dev
```

## Configuration

Add `prettier-plugin-jsdoc` to your `plugins` list.

`.prettierrc`:

```json
{
  "plugins": ["prettier-plugin-jsdoc"]
}
```

`prettier.config.js`:

```js
export default {
  plugins: ["prettier-plugin-jsdoc"],
}
```

If you want to ignore some types of files, use `overrides` with an empty `plugins`:

```json
{
  "plugins": ["prettier-plugin-jsdoc"],
  "overrides": [
    {
      "files": "*.tsx",
      "options": {
        "plugins": []
      }
    }
  ]
}
```

## Ignore

To prevent Prettier from formatting, use `/* */` or `//` instead of /\*\* \*/, or see [Ignoring Code](https://prettier.io/docs/en/ignore#javascript).

## Examples

#### Single line

```js
/**
 * @param {  string   }    param0 description
 */
function fun(param0) {}
```

Formats to:

```js
/** @param {string} param0 Description */
function fun(param0) {}
```

#### React component

```js
/**
 * @type {React.FC<{   message:string}   >}
 */
const Component = memo(({ message }) => {
  return <p>{message}</p>;
});
```

Formats to:

```js
/** @type {React.FC<{message: string}>} */
const Component = memo(({ message }) => {
  return <p>{message}</p>;
});
```

#### TypeScript objects

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

Format to:

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

Add code to `@examples` tag.

```js
/**
 * @examples
 *   var one= 5
 *   var two=10
 *
 *   if(one > 2) { two += one }
 */
```

Formats to:

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

`@description` is formatted as Markdown so that you can use any features of Markdown on that.
Like code tags (` ```js `), header tags like `# Header`, or other Markdown features.

## Options

| Key                                 | Type                              | Default      | Description                                                                                     |
| :---------------------------------- | :-------------------------------- | :----------- | ----------------------------------------------------------------------------------------------- |
| `jsdocSpaces`                       | Number                            | 1            |
| `jsdocDescriptionWithDot`           | Boolean                           | false        |
| `jsdocDescriptionTag`               | Boolean                           | false        |
| `jsdocVerticalAlignment`            | Boolean                           | false        |
| `jsdocKeepUnParseAbleExampleIndent` | Boolean                           | false        |
| `jsdocCommentLineStrategy`          | ("singleLine","multiline","keep") | "singleLine" |
| `jsdocCapitalizeDescription`        | Boolean                           | true         |
| `jsdocSeparateReturnsFromParam`     | Boolean                           | false        | Adds a space between last `@param` and `@returns`                                               |
| `jsdocSeparateTagGroups`            | Boolean                           | false        | Adds a space between tag groups                                                                 |
| `jsdocPreferCodeFences`             | Boolean                           | false        | Always fence code blocks (surround them by triple backticks)                                    |
| `tsdoc`                             | Boolean                           | false        | See [TSDoc](#tsdoc)                                                                           |
| `jsdocPrintWidth`                   | Number                            | undefined    | If you don't set the value to `jsdocPrintWidth`, `printWidth` will be used as `jsdocPrintWidth` |
| `jsdocLineWrappingStyle`            | String                            | "greedy"     | "greedy": lines wrap as soon as they reach `printWidth`                                         |
| `jsdocTagsOrder`                    | String (object)                   | undefined    | See [Custom Tags Order](doc/CUSTOM_TAGS_ORDER.md)                                               |

### TSDoc

We hope to support the whole [TSDoc](https://tsdoc.org/).
If we missed something, please [create an issue](https://github.com/hosseinmd/prettier-plugin-jsdoc/issues/new).

To enable, add:

```json
{
  "tsdoc": true
}
```

## Supported Prettier versions

| Plugin version | Prettier version |
| -------------- | ---------------- |
| 1.0.0+         | 3.0.0+           |
| 0.4.2          | 2.x+             |

## Contributing

1. Fork and clone the repository
2. [Install Yarn](https://yarnpkg.com/getting-started/install)
3. Install project dependencies:
   
   ```sh
   yarn install
   ```
4. Make changes and make sure that tests pass:
   ```js
   yarn run test
   ```
5. Update or add tests to your changes if needed
6. Create PR

## Links

- [Prettier](https://prettier.io)
- [JSDoc](https://jsdoc.app)

## Acknowledge

This project extended from the @gum3n worked project on GitLab.
