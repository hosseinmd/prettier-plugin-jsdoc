import prettier from "prettier";
import { readFileSync } from "fs";
import { resolve } from "path";
import { JsdocOptions } from "../src/types";

require("jest-specific-snapshot");

function subjectFiles(
  relativePath: string,
  options: Partial<JsdocOptions> = {},
) {
  const filepath = resolve(__dirname, relativePath);

  try {
    const code = readFileSync(filepath).toString();

    return prettier.format(code, {
      plugins: ["."],
      jsdocSpaces: 1,
      trailingComma: "all",
      filepath,
      ...options,
    } as JsdocOptions);
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
const files: {
  name: string;
  options?: Partial<JsdocOptions>;
}[] = [
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
      `./__snapshots__/files/${name}.shot`,
    );
  });
}
