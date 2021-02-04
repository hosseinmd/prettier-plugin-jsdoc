const prettier = require("prettier");
const { readFileSync } = require("fs");
const { resolve } = require("path");

function subjectFiles(relativePath, options = {}) {
  const filepath = resolve(__dirname, relativePath);

  try {
    const code = readFileSync(filepath).toString();

    return prettier.format(code, {
      plugins: ["."],
      jsdocSpaces: 1,
      trailingComma: "all",
      filepath,
      ...options,
    });
  } catch (error) {
    console.error(error);
  }
}

/**
 * @type {TestFile[]}
 *
 * @typedef TestFile
 * @property {string} path
 * @property {import("prettier").Options} [options]
 */
const files = [
  { path: "./files/typeScript.js" },
  { path: "./files/typeScript.js" },
  { path: "./files/typeScript.ts" },
  { path: "./files/types.ts" },
  { path: "./files/order.jsx" },
  { path: "./files/create-ignorer.js" },
  {
    path: "./files/prism-core.js",
    options: {
      arrowParens: "avoid",
      printWidth: 120,
      quoteProps: "preserve",
      semi: true,
      singleQuote: true,
      tabWidth: 4,
      trailingComma: "none",
      useTabs: true,
      jsdocKeepUnParseAbleExampleIndent: true,
    },
  },
];

for (const { path, options } of files) {
  test(`File: ${path} Options: ${JSON.stringify(options || {})}`, () => {
    const result = subjectFiles(path, options);
    expect(result).toMatchSnapshot();
  });
}
