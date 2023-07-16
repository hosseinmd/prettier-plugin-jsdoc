import { parsers as typescriptParsers } from "prettier/plugins/typescript";

/**
 *
 * @param {*} text
 * @param {import("prettier/index").Options} options
 * @returns
 */
const preprocess = (text, options) => {
  if (
    options.plugins.find((plugin) => plugin.name?.includes("prettier-plugin-fake"))
  ) {
    return `//prettier-plugin-fake\n${text}`;
  }
  return text;
};

export const parsers = {
  typescript: {
    ...typescriptParsers.typescript,
    preprocess: typescriptParsers.typescript.preprocess
      ? (text, options) =>
          preprocess(
            typescriptParsers.typescript.preprocess(text, options),
            options,
          )
      : preprocess,
    parse: (text, options) => {
      const ast = typescriptParsers.typescript.parse(text, options);
      if (ast.comments) {
        ast.comments[0].value = "PRETTIER-PLUGIN-FAKE";
      }

      return ast;
    },
  },
};
