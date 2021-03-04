import { getParser } from "./parser";
import parserBabel from "prettier/parser-babel";
import parserFlow from "prettier/parser-flow";
import parserTypescript from "prettier/parser-typescript";
import prettier, { SupportOption } from "prettier";
import { JsdocOptions } from "./types";

const options: Record<keyof JsdocOptions, SupportOption> = {
  jsdocParser: {
    name: "jsdocParser",
    type: "boolean",
    category: "jsdoc",
    default: true,
    description: "Format with jsdoc if is true",
  },
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
    default: true,
    description: "Should compact single line comment",
  },
  tsdoc: {
    name: "tsdoc",
    type: "boolean",
    category: "jsdoc",
    default: false,
    description: "Should format as tsdoc",
  },
};

const defaultOptions: JsdocOptions = {
  jsdocParser: options.jsdocParser.default as boolean,
  jsdocSpaces: options.jsdocSpaces.default as number,
  jsdocDescriptionWithDot: options.jsdocDescriptionWithDot.default as boolean,
  jsdocDescriptionTag: options.jsdocDescriptionTag.default as boolean,
  jsdocVerticalAlignment: options.jsdocVerticalAlignment.default as boolean,
  jsdocKeepUnParseAbleExampleIndent: options.jsdocKeepUnParseAbleExampleIndent
    .default as boolean,
  jsdocSingleLineComment: options.jsdocSingleLineComment.default as boolean,
  tsdoc: options.tsdoc.default as boolean,
};

const languages = prettier
  .getSupportInfo()
  .languages.filter(({ name }) =>
    [
      "JavaScript",
      "Flow",
      "JSX",
      "TSX",
      "TypeScript",
      "Markdown",
      "MDX",
    ].includes(name),
  );

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
  get "jsdoc-parser"() {
    // Backward compatible, don't use this in new version since 1.0.0
    const parser = parserBabel.parsers["babel-ts"];
    return { ...parser, parse: getParser(parser.parse) };
  },
};

export { languages, options, parsers, defaultOptions };
