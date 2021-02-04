const prettier = require("prettier");
const { readFileSync } = require("fs");
const { resolve } = require("path");
require("jest-specific-snapshot");

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
 * @property {string} name
 * @property {import("prettier").Options} [options]
 */
const files = [
  { name: "typeScript.js" },
  { name: "typeScript.js" },
  { name: "typeScript.ts" },
  { name: "types.ts" },
  { name: "order.jsx" },
  { name: "create-ignorer.js" },
  {
    name: "prism-core.js",
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

for (let i = 0; i < files.length; i++) {
  const { name, options } = files[i];
  test(`File: ${name} Options: ${JSON.stringify(options || {})}`, () => {
    const result = subjectFiles("./files/" + name, options);
    expect(result).toMatchSpecificSnapshot(
      `./__snapshots__/files/${name}.${i}.shot`,
    );
  });
}
