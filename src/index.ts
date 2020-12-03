import { getParser } from "./parser";
import parserBabel from "prettier/parser-babel";
import parserFlow from "prettier/parser-flow";
import parserTypescript from "prettier/parser-typescript";
import prettier from "prettier";

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

module.exports = {
  languages,
  options,
  parsers,
  defaultOptions,
};
