import { getParser } from "./parser.js";
import parserBabel from "prettier/plugins/babel";
import parserFlow from "prettier/plugins/flow";
import parserTypescript from "prettier/plugins/typescript";
import prettier, { ChoiceSupportOption, SupportOption } from "prettier";
import { JsdocOptions } from "./types.js";
import { findPluginByParser } from "./utils.js";

const options = {
  jsdocSpaces: {
    name: "jsdocSpaces",
    type: "int",
    category: "jsdoc",
    default: 1,
    description: "How many spaces will be used to separate tag elements.",
  },
  jsdocDescriptionWithDot: {
    name: "jsdocDescriptionWithDot",
    type: "boolean",
    category: "jsdoc",
    default: false,
    description: "Should dot be inserted at the end of description",
  },
  jsdocDescriptionTag: {
    name: "jsdocDescriptionTag",
    type: "boolean",
    category: "jsdoc",
    default: false,
    description: "Should description tag be used",
  },
  jsdocVerticalAlignment: {
    name: "jsdocVerticalAlignment",
    type: "boolean",
    category: "jsdoc",
    default: false,
    description: "Should tags, types, names and description be aligned",
  },
  jsdocKeepUnParseAbleExampleIndent: {
    name: "jsdocKeepUnParseAbleExampleIndent",
    type: "boolean",
    category: "jsdoc",
    default: false,
    description:
      "Should unParseAble example (pseudo code or no js code) keep its indentation",
  },
  jsdocSingleLineComment: {
    name: "jsdocSingleLineComment",
    type: "boolean",
    category: "jsdoc",
    deprecated: "use jsdocCommentLineStrategy instead will be remove on v2",
    default: true,
    description: "Should compact single line comment",
  },
  jsdocCommentLineStrategy: {
    name: "jsdocCommentLineStrategy",
    type: "choice",
    choices: [
      {
        value: "singleLine",
        description: `Should compact single line comment, if possible`,
      },
      {
        value: "multiline",
        description: `Should compact multi line comment`,
      },
      {
        value: "keep",
        description: `Should keep original line comment`,
      },
    ] as ChoiceSupportOption["choices"],
    category: "jsdoc",
    default: "singleLine",
    description: "How comments line should be",
  },
  jsdocSeparateReturnsFromParam: {
    name: "jsdocSeparateReturnsFromParam",
    type: "boolean",
    category: "jsdoc",
    default: false,
    description: "Add an space between last @param and @returns",
  },
  jsdocSeparateTagGroups: {
    name: "jsdocSeparateTagGroups",
    type: "boolean",
    category: "jsdoc",
    default: false,
    description: "Add an space between tag groups",
  },
  jsdocCapitalizeDescription: {
    name: "jsdocCapitalizeDescription",
    type: "boolean",
    category: "jsdoc",
    default: true,
    description: "Should capitalize first letter of description",
  },
  tsdoc: {
    name: "tsdoc",
    type: "boolean",
    category: "jsdoc",
    default: false,
    description: "Should format as tsdoc",
  },
  jsdocPrintWidth: {
    name: "jsdocPrintWidth",
    type: "int",
    category: "jsdoc",
    default: undefined,
    description:
      "If You don't set value to jsdocPrintWidth, the printWidth will be use as jsdocPrintWidth.",
  },
  jsdocAddDefaultToDescription: {
    name: "jsdocAddDefaultToDescription",
    type: "boolean",
    category: "jsdoc",
    default: true,
    description: "Add Default value of a param to end description",
  },
  jsdocPreferCodeFences: {
    name: "jsdocPreferCodeFences",
    type: "boolean",
    category: "jsdoc",
    default: false,
    description: `Prefer to render code blocks using "fences" (triple backticks). If not set, blocks without a language tag will be rendered with a four space indentation.`,
  },
  jsdocLineWrappingStyle: {
    name: "jsdocLineWrappingStyle",
    type: "choice",
    choices: [
      {
        value: "greedy",
        description: `Lines wrap as soon as they reach the print width`,
      },
      {
        value: "balance",
        description: `Preserve existing line breaks if lines are shorter than print width, otherwise use greedy wrapping`,
      },
    ] as ChoiceSupportOption["choices"],
    category: "jsdoc",
    default: "greedy",
    description: `Strategy for wrapping lines for the given print width. More options may be added in the future.`,
  },
  jsdocTagsOrder: {
    name: "jsdocTagsOrder",
    type: "string",
    category: "jsdoc",
    default: undefined,
    description: "How many spaces will be used to separate tag elements.",
  },
  jsdocMergeImports: {
    name: "jsdocMergeImports",
    type: "boolean",
    category: "jsdoc",
    default: true,
    description:
      "Merge all imports tags in the same block from the same source into one tag",
  },
  jsdocNamedImportPadding: {
    name: "jsdocNamedImportPadding",
    type: "boolean",
    category: "jsdoc",
    default: false,
    description: "Whether or not to pad brackets for single line named imports",
  },
  jsdocNamedImportLineSplitting: {
    name: "jsdocNamedImportLineSplitting",
    type: "boolean",
    category: "jsdoc",
    default: true,
    description:
      "Split import tags with multiple named imports into multiple lines",
  },
  jsdocFormatImports: {
    name: "jsdocFormatImports",
    type: "boolean",
    category: "jsdoc",
    default: true,
    description: "Format import tags",
  },
  jsdocEmptyCommentStrategy: {
    name: "jsdocEmptyCommentStrategy",
    type: "choice",
    choices: [
      {
        value: "remove",
        description: "Remove empty JSDoc comment blocks",
      },
      {
        value: "keep",
        description: "Keep empty JSDoc comment blocks",
      },
    ] as ChoiceSupportOption["choices"],
    category: "jsdoc",
    default: "remove",
    description: "How to handle empty JSDoc comment blocks",
  },
} as const satisfies Record<keyof JsdocOptions, SupportOption>;

const defaultOptions: JsdocOptions = {
  jsdocSpaces: options.jsdocSpaces.default,
  jsdocPrintWidth: options.jsdocPrintWidth.default,
  jsdocDescriptionWithDot: options.jsdocDescriptionWithDot.default,
  jsdocDescriptionTag: options.jsdocDescriptionTag.default,
  jsdocVerticalAlignment: options.jsdocVerticalAlignment.default,
  jsdocKeepUnParseAbleExampleIndent:
    options.jsdocKeepUnParseAbleExampleIndent.default,
  jsdocSingleLineComment: options.jsdocSingleLineComment.default,
  jsdocCommentLineStrategy: options.jsdocCommentLineStrategy.default,
  jsdocSeparateReturnsFromParam: options.jsdocSeparateReturnsFromParam.default,
  jsdocSeparateTagGroups: options.jsdocSeparateTagGroups.default,
  jsdocCapitalizeDescription: options.jsdocCapitalizeDescription.default,
  jsdocAddDefaultToDescription: options.jsdocAddDefaultToDescription.default,
  jsdocPreferCodeFences: options.jsdocPreferCodeFences.default,
  tsdoc: options.tsdoc.default,
  jsdocLineWrappingStyle: options.jsdocLineWrappingStyle.default,
  jsdocTagsOrder: options.jsdocTagsOrder.default,
  jsdocFormatImports: options.jsdocFormatImports.default,
  jsdocNamedImportPadding: options.jsdocNamedImportPadding.default,
  jsdocMergeImports: options.jsdocMergeImports.default,
  jsdocNamedImportLineSplitting: options.jsdocNamedImportLineSplitting.default,
  jsdocEmptyCommentStrategy: options.jsdocEmptyCommentStrategy.default,
};

const parsers = {
  // JS - Babel
  get babel() {
    const parser = parserBabel.parsers.babel;
    return mergeParsers(parser, "babel");
  },
  get "babel-flow"() {
    const parser = parserBabel.parsers["babel-flow"];
    return mergeParsers(parser, "babel-flow");
  },
  get "babel-ts"() {
    const parser = parserBabel.parsers["babel-ts"];
    return mergeParsers(parser, "babel-ts");
  },
  // JS - Flow
  get flow() {
    const parser = parserFlow.parsers.flow;
    return mergeParsers(parser, "flow");
  },
  // JS - TypeScript
  get typescript(): prettier.Parser {
    const parser = parserTypescript.parsers.typescript;

    return mergeParsers(parser, "typescript");
    // require("./parser-typescript").parsers.typescript;
  },
  get "jsdoc-parser"() {
    // Backward compatible, don't use this in new version since 1.0.0
    const parser = parserBabel.parsers["babel-ts"];

    return mergeParsers(parser, "babel-ts");
  },
};

function mergeParsers(originalParser: prettier.Parser, parserName: string) {
  const jsDocParse = getParser(originalParser.parse, parserName) as any;
  let hasPreprocessed = false;

  const jsDocPreprocess = (text: string, options: prettier.ParserOptions) => {
    normalizeOptions(options as any);

    // Prevent infinite recursion by checking if we've already preprocessed
    if (hasPreprocessed) {
      return text;
    }

    hasPreprocessed = true;
    try {
      const tsPluginParser = findPluginByParser(parserName, options);

      if (!tsPluginParser) {
        return originalParser.preprocess
          ? originalParser.preprocess(text, options)
          : text;
      }

      const preprocess =
        tsPluginParser?.preprocess || originalParser.preprocess;
      return preprocess ? preprocess(text, options) : text;
    } finally {
      hasPreprocessed = false;
    }
  };

  const parser = {
    ...originalParser,
    preprocess: jsDocPreprocess,
    parse: jsDocParse,
  };

  return parser;
}

const name = "prettier-plugin-jsdoc";
export { name, options, parsers, defaultOptions };
export type Options = Partial<JsdocOptions>;

function normalizeOptions(options: prettier.ParserOptions & JsdocOptions) {
  if (options.jsdocTagsOrder) {
    options.jsdocTagsOrder = JSON.parse(options.jsdocTagsOrder as any);
  }

  if (options.jsdocCommentLineStrategy) {
    return;
  }
  if (options.jsdocSingleLineComment) {
    options.jsdocCommentLineStrategy = "singleLine";
  } else {
    options.jsdocCommentLineStrategy = "multiline";
  }
}
