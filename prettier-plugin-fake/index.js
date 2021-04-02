const { parsers: typescriptParsers } = require("prettier/parser-typescript");

/**
 *
 * @param {*} text
 * @param {import("prettier/index").Options} options
 * @returns
 */
const preprocess = (text, options) => {
  if (
    options.plugins.find((plugin) => plugin.name === "prettier-plugin-fake")
  ) {
    return `//prettier-plugin-fake\n${text}`;
  }
  return text;
};

exports.parsers = {
  typescript: {
    ...typescriptParsers.typescript,
    preprocess: typescriptParsers.typescript.preprocess
      ? (text, options) =>
          preprocess(
            typescriptParsers.typescript.preprocess(text, options),
            options,
          )
      : preprocess,
  },
};
