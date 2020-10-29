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
import javascriptJson from "linguist-languages/data/JavaScript.json";
import jsxJson from "linguist-languages/data/JSX.json";
import typescriptJson from "linguist-languages/data/TypeScript.json";
import tsxJson from "linguist-languages/data/TSX.json";
import jsonJson from "linguist-languages/data/JSON.json";
import jsonWithCommentJson from "linguist-languages/data/JSON with Comments.json";
import json5Json from "linguist-languages/data/JSON5.json";
import parserBabel from "prettier/parser-babel";
import parserFlow from "prettier/parser-flow";
import parserTypescript from "prettier/parser-typescript";
import parserAngular from "prettier/parser-angular";

export const options = {
  jsdocParser: {
    type: "boolean",
    category: "jsdoc",
    default: true,
    description: "Format with jsdoc if is true",
  },
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
  jsdocParser: true,
  jsdocSpaces: 1,
  jsdocDescriptionWithDot: false,
  jsdocDescriptionTag: false,
  jsdocVerticalAlignment: false,
  jsdocKeepUnParseAbleExampleIndent: false,
};

const languages = [
  createLanguage(javascriptJson, (data: any) => ({
    since: "0.0.0",
    parsers: ["babel", "babel-flow", "babel-ts", "flow", "typescript"],
    vscodeLanguageIds: ["javascript", "mongo"],
    extensions: [
      ...data.extensions,
      // WeiXin Script (Weixin Mini Programs)
      // https://developers.weixin.qq.com/miniprogram/en/dev/framework/view/wxs/
      ".wxs",
    ],
  })),
  createLanguage(javascriptJson, () => ({
    name: "Flow",
    since: "0.0.0",
    parsers: ["flow", "babel-flow"],
    vscodeLanguageIds: ["javascript"],
    aliases: [],
    filenames: [],
    extensions: [".js.flow"],
  })),
  createLanguage(jsxJson, () => ({
    since: "0.0.0",
    parsers: ["babel", "babel-flow", "babel-ts", "flow", "typescript"],
    vscodeLanguageIds: ["javascriptreact"],
  })),
  createLanguage(typescriptJson, () => ({
    since: "1.4.0",
    parsers: ["typescript", "babel-ts"],
    vscodeLanguageIds: ["typescript"],
  })),
  createLanguage(tsxJson, () => ({
    since: "1.4.0",
    parsers: ["typescript", "babel-ts"],
    vscodeLanguageIds: ["typescriptreact"],
  })),
  createLanguage(jsonJson, () => ({
    name: "JSON.stringify",
    since: "1.13.0",
    parsers: ["json-stringify"],
    vscodeLanguageIds: ["json"],
    extensions: [], // .json file defaults to json instead of json-stringify
    filenames: ["package.json", "package-lock.json", "composer.json"],
  })),
  createLanguage(jsonJson, (data: any) => ({
    since: "1.5.0",
    parsers: ["json"],
    vscodeLanguageIds: ["json"],
    filenames: [...data.filenames, ".prettierrc"],
  })),
  createLanguage(jsonWithCommentJson, (data: any) => ({
    since: "1.5.0",
    parsers: ["json"],
    vscodeLanguageIds: ["jsonc"],
    filenames: [...data.filenames, ".eslintrc"],
  })),
  createLanguage(json5Json, () => ({
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
    const parser = parserBabel.parsers.babel;
    return { ...parser, parse: getParser(parser.parse) };
  },
  get "babel-flow"() {
    const parser = parserBabel.parsers["babel-flow"];
    return { ...parser, parse: getParser(parser.parse) };
  },
  get "babel-ts"() {
    const parser = parserBabel.parsers["babel-ts"];
    return { ...parser, parse: getParser(parser.parse) };
  },
  get json() {
    return parserBabel.parsers.json;
  },
  get json5() {
    return parserBabel.parsers.json5;
  },
  get "json-stringify"() {
    return parserBabel.parsers["json-stringify"];
  },
  get __js_expression() {
    return parserBabel.parsers.__js_expression;
  },
  get __vue_expression() {
    return parserBabel.parsers.__vue_expression;
  },
  get __vue_event_binding() {
    return parserBabel.parsers.__vue_event_binding;
  },
  // JS - Flow
  get flow() {
    const parser = parserFlow.parsers.flow;
    return { ...parser, parse: getParser(parser.parse) };
  },
  // JS - TypeScript
  get typescript() {
    const parser = parserTypescript.parsers.typescript;
    return { ...parser, parse: getParser(parser.parse) };
    // require("./parser-typescript").parsers.typescript;
  },
  // JS - Angular Action
  get __ng_action() {
    const parser = parserAngular.parsers.__ng_action;
    return { ...parser, parse: getParser(parser.parse) };
  },
  // JS - Angular Binding
  get __ng_binding() {
    const parser = parserAngular.parsers.__ng_binding;
    return { ...parser, parse: getParser(parser.parse) };
  },
  // JS - Angular Interpolation
  get __ng_interpolation() {
    const parser = parserAngular.parsers.__ng_interpolation;
    return { ...parser, parse: getParser(parser.parse) };
  },
  // JS - Angular Directive
  get __ng_directive() {
    const parser = parserAngular.parsers.__ng_directive;
    return { ...parser, parse: getParser(parser.parse) };
  },
  get "jsdoc-parser"() {
    // Backward compatible, don't use this in new version since 1.0.0
    const parser = parserBabel.parsers["babel-ts"];
    return { ...parser, parse: getParser(parser.parse) };
  },
};

module.exports = {
  languages,
  options,
  parsers,
  defaultOptions,
};
