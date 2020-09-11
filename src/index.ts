import {
  ABSTRACT,
  ASYNC,
  AUGMENTS,
  AUTHOR,
  CALLBACK,
  CATEGORY,
  CLASS,
  CONSTANT,
  DEFAULT,
  DEPRECATED,
  DESCRIPTION,
  EXAMPLE,
  EXTENDS,
  EXTERNAL,
  FILE,
  FIRES,
  FUNCTION,
  MEMBER,
  MEMBEROF,
  PARAM,
  PRIVATE,
  PROPERTY,
  RETURNS,
  SEE,
  SINCE,
  TEMPLATE,
  THROWS,
  TODO,
  TYPE,
  TYPEDEF,
  VERSION,
  YIELDS,
} from "./tags";
import { getParser } from "./parser";
import createLanguage from "./create-language";

// jsdoc-parser
// const languages = [
//   {
//     name: "JavaScript",
//     parsers: ["jsdoc-parser"],
//   },
// ];

// export const parsers = {
//   "jsdoc-parser": { ...babelTs, parse: jsdocParser },
// };

export const options = {
  jsdocSpaces: {
    type: "int",
    category: "jsdoc",
    default: 1,
    description: "How many spaces will be used to separate tag elements.",
  },
  jsdocTagsOrder: {
    type: "path",
    category: "jsdoc",
    array: true,
    default: [
      {
        value: [
          ASYNC,
          PRIVATE,
          MEMBEROF,
          VERSION,
          AUTHOR,
          DEPRECATED,
          SINCE,
          CATEGORY,
          DESCRIPTION,
          EXAMPLE,
          ABSTRACT,
          AUGMENTS,
          CONSTANT,
          DEFAULT,
          EXTERNAL,
          FILE,
          FIRES,
          TEMPLATE,
          FUNCTION,
          CLASS,
          TYPEDEF,
          TYPE,
          CALLBACK,
          PROPERTY,
          PARAM,
          EXTENDS,
          MEMBER,
          SEE,
          "other",
          THROWS,
          YIELDS,
          RETURNS,
          TODO,
        ],
      },
    ],
    description: "Define order of tags.",
  },
  jsdocDescriptionWithDot: {
    type: "boolean",
    category: "jsdoc",
    default: false,
    description: "Should dot be inserted at the end of description",
  },
  jsdocDescriptionTag: {
    type: "boolean",
    category: "jsdoc",
    default: false,
    description: "Should description tag be used",
  },
  jsdocVerticalAlignment: {
    type: "boolean",
    category: "jsdoc",
    default: false,
    description: "Should tags, types, names and description be aligned",
  },
  jsdocKeepUnParseAbleExampleIndent: {
    type: "boolean",
    category: "jsdoc",
    default: false,
    description:
      "Should unParseAble example (pseudo code or no js code) keep its indentation",
  },
};

const defaultOptions = {
  jsdocSpaces: 1,
  jsdocDescriptionWithDot: false,
  jsdocDescriptionTag: false,
  jsdocVerticalAlignment: false,
  jsdocKeepUnParseAbleExampleIndent: false,
};

// const createLanguage = require("../utils/create-language");
// const estreePrinter = require("./printer-estree");
// const estreeJsonPrinter = require("./printer-estree-json");
// const options = require("./options");

const languages = [
  createLanguage(
    require("linguist-languages/data/JavaScript.json"),
    (data: any) => ({
      since: "0.0.0",
      parsers: ["babel", "babel-flow", "babel-ts", "flow", "typescript"],
      vscodeLanguageIds: ["javascript", "mongo"],
      extensions: [
        ...data.extensions,
        // WeiXin Script (Weixin Mini Programs)
        // https://developers.weixin.qq.com/miniprogram/en/dev/framework/view/wxs/
        ".wxs",
      ],
    })
  ),
  createLanguage(require("linguist-languages/data/JavaScript.json"), () => ({
    name: "Flow",
    since: "0.0.0",
    parsers: ["flow", "babel-flow"],
    vscodeLanguageIds: ["javascript"],
    aliases: [],
    filenames: [],
    extensions: [".js.flow"],
  })),
  createLanguage(require("linguist-languages/data/JSX.json"), () => ({
    since: "0.0.0",
    parsers: ["babel", "babel-flow", "babel-ts", "flow", "typescript"],
    vscodeLanguageIds: ["javascriptreact"],
  })),
  createLanguage(require("linguist-languages/data/TypeScript.json"), () => ({
    since: "1.4.0",
    parsers: ["typescript", "babel-ts"],
    vscodeLanguageIds: ["typescript"],
  })),
  createLanguage(require("linguist-languages/data/TSX.json"), () => ({
    since: "1.4.0",
    parsers: ["typescript", "babel-ts"],
    vscodeLanguageIds: ["typescriptreact"],
  })),
  createLanguage(require("linguist-languages/data/JSON.json"), () => ({
    name: "JSON.stringify",
    since: "1.13.0",
    parsers: ["json-stringify"],
    vscodeLanguageIds: ["json"],
    extensions: [], // .json file defaults to json instead of json-stringify
    filenames: ["package.json", "package-lock.json", "composer.json"],
  })),
  createLanguage(require("linguist-languages/data/JSON.json"), (data: any) => ({
    since: "1.5.0",
    parsers: ["json"],
    vscodeLanguageIds: ["json"],
    filenames: [...data.filenames, ".prettierrc"],
  })),
  createLanguage(
    require("linguist-languages/data/JSON with Comments.json"),
    (data: any) => ({
      since: "1.5.0",
      parsers: ["json"],
      vscodeLanguageIds: ["jsonc"],
      filenames: [...data.filenames, ".eslintrc"],
    })
  ),
  createLanguage(require("linguist-languages/data/JSON5.json"), () => ({
    since: "1.13.0",
    parsers: ["json5"],
    vscodeLanguageIds: ["json5"],
  })),
];

// const printers = {
//   estree: estreePrinter,
//   "estree-json": estreeJsonPrinter,
// };

const parsers = {
  // JS - Babel
  get babel() {
    const parser = require("prettier/parser-babel").parsers.babel;
    return { ...parser, parse: getParser(parser.parse) };
  },
  get "babel-flow"() {
    const parser = require("prettier/parser-babel").parsers["babel-flow"];
    return { ...parser, parse: getParser(parser.parse) };
  },
  get "babel-ts"() {
    const parser = require("prettier/parser-babel").parsers["babel-ts"];
    return { ...parser, parse: getParser(parser.parse) };
  },
  get json() {
    return require("prettier/parser-babel").parsers.json;
  },
  get json5() {
    return require("prettier/parser-babel").parsers.json5;
  },
  get "json-stringify"() {
    return require("prettier/parser-babel").parsers["json-stringify"];
  },
  get __js_expression() {
    return require("prettier/parser-babel").parsers.__js_expression;
  },
  get __vue_expression() {
    return require("prettier/parser-babel").parsers.__vue_expression;
  },
  get __vue_event_binding() {
    return require("prettier/parser-babel").parsers.__vue_event_binding;
  },
  // JS - Flow
  get flow() {
    const parser = require("prettier/parser-flow").parsers.flow;
    return { ...parser, parse: getParser(parser.parse) };
  },
  // JS - TypeScript
  get typescript() {
    const parser = require("prettier/parser-typescript").parsers.typescript;
    return { ...parser, parse: getParser(parser.parse) };
    // require("./parser-typescript").parsers.typescript;
  },
  // JS - Angular Action
  get __ng_action() {
    const parser = require("prettier/parser-angular").parsers.__ng_action;
    return { ...parser, parse: getParser(parser.parse) };
  },
  // JS - Angular Binding
  get __ng_binding() {
    const parser = require("prettier/parser-angular").parsers.__ng_binding;
    return { ...parser, parse: getParser(parser.parse) };
  },
  // JS - Angular Interpolation
  get __ng_interpolation() {
    const parser = require("prettier/parser-angular").parsers
      .__ng_interpolation;
    return { ...parser, parse: getParser(parser.parse) };
  },
  // JS - Angular Directive
  get __ng_directive() {
    const parser = require("prettier/parser-angular").parsers.__ng_directive;
    return { ...parser, parse: getParser(parser.parse) };
  },
};

module.exports = {
  languages,
  options,
  // printers,
  parsers,
  defaultOptions,
};
