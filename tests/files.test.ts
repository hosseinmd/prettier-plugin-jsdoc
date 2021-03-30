import prettier from "prettier";
import { readFileSync } from "fs";
import { resolve } from "path";
import { AllOptions } from "../src/types";

require("jest-specific-snapshot");

function subjectFiles(relativePath: string, options: Partial<AllOptions> = {}) {
  const filepath = resolve(__dirname, relativePath);

  try {
    const code = readFileSync(filepath).toString();

    return prettier.format(code, {
      plugins: ["."],
      jsdocSpaces: 1,
      trailingComma: "all",
      filepath,
      ...options,
    } as AllOptions);
  } catch (error) {
    console.error(error);
  }
}

const PrismOptions = {
  arrowParens: "avoid",
  printWidth: 120,
  quoteProps: "preserve",
  semi: true,
  singleQuote: true,
  tabWidth: 4,
  trailingComma: "none",
  useTabs: true,
  jsdocKeepUnParseAbleExampleIndent: true,
} as const;

/**
 * @type {TestFile[]}
 *
 * @typedef TestFile
 * @property {string} name
 * @property {import("prettier").Options} [options]
 */
const files: {
  name: string;
  options?: Partial<AllOptions>;
}[] = [
  { name: "typeScript.js" },
  { name: "typeScript.js" },
  { name: "typeScript.ts" },
  { name: "types.ts" },
  { name: "order.jsx" },
  { name: "create-ignorer.js" },
  {
    name: "prism-core.js",
    options: PrismOptions,
  },
  {
    name: "prism-dependencies.js",
    options: PrismOptions,
  },
  {
    name: "tsdoc.ts",
    options: {
      tsdoc: true,
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
