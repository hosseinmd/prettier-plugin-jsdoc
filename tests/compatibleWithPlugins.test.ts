import * as prettier from "prettier";
import { AllOptions } from "../src/types";
import { execSync } from "child_process";
import { mkdirSync, writeFileSync, readFileSync, rmSync } from "fs";
import { join } from "path";

function subject(code: string, options: Partial<AllOptions> = {}) {
  return prettier.format(code, {
    parser: "typescript",
    plugins: ["./prettier-plugin-fake/index.js", "prettier-plugin-jsdoc"],
    jsdocSpaces: 1,
    ...options,
  } as AllOptions);
}

function subjectTailwindcss(code: string, options: Partial<AllOptions> = {}) {
  return prettier.format(code, {
    parser: "typescript",
    plugins: ["prettier-plugin-tailwindcss", "prettier-plugin-jsdoc"],
    jsdocSpaces: 1,
    ...options,
  } as AllOptions);
}

test("Should format regular jsDoc", async () => {
  const code = `
  import b from "b"
  import {k} from "k"
  import a from "a"

/**
* function example description that was wrapped by hand
* so it have more then one line and don't end with a dot
* REPEATED TWO TIMES BECAUSE IT WAS EASIER to copy
* function example description that was wrapped by hand
* so it have more then one line.
* @return {Boolean} Description for @returns with s
* @param {String|Number} text - some text description that is very long and needs to be wrapped
* @param {String} [defaultValue="defaultTest"] TODO
* @arg {Number|Null} [optionalNumber]
* @private
*@memberof test
@async
* @examples
*   var one = 5
*   var two = 10
*
*   if(one > 2) { two += one }
* @undefiendTag${" "}
* @undefiendTag {number} name des
*/
const testFunction = (text, defaultValue, optionalNumber) => true
`;
  const result = await subject(code);

  expect(result).toMatchSnapshot();
  expect(await subject(result)).toMatchSnapshot();
});

test("Should format jsDoc default values", async () => {
  const result = await subject(`
/**
* @param {String} [arg1="defaultTest"] foo
* @param {number} [arg2=123] the width of the rectangle
* @param {number} [arg3= 123 ]
* @param {number} [arg4= Foo.bar.baz ]
* @param {number|string} [arg5=123] Something. Default is \`"wrong"\`
*/
`);

  expect(result).toMatchSnapshot();
  expect(await subject(result)).toMatchSnapshot();
});

test("Should convert to single line if necessary", async () => {
  const Result1 = await subject(`/** single line description*/`);
  const Result2 = await subject(`/**
 * single line description
 * @example
 */`);

  const Result3 = await subject(`/**
 * single line description
 * @return {Boolean} Always true
 * @example
 */`);

  expect(Result1).toMatchSnapshot();
  expect(Result2).toMatchSnapshot();
  expect(Result3).toMatchSnapshot();
});

test("Should compatible with tailwindcss", async () => {
  const code = `
/**
* @param {String} [arg1="defaultTest"]        foo
* @param {number} [arg2=123] the width of the rectangle
* @param {number} [arg3= 123 ]
* @param {number} [arg4= Foo.bar.baz ]
* @param {number|string} [arg5=123] Something. Default is \`"wrong"\`
*/
  `;
  const result = await subjectTailwindcss(code);

  expect(result).toMatchSnapshot();
});

describe("CLI Compatibility", () => {
  // CLI-based tests
  const testDir = join(process.cwd(), ".test-cli-temp");

  beforeAll(() => {
    try {
      mkdirSync(testDir, { recursive: true });
    } catch (err) {
      // Directory might already exist
    }
  });

  afterAll(() => {
    try {
      rmSync(testDir, { recursive: true, force: true });
    } catch (err) {
      // Ignore cleanup errors
    }
  });

  function runCommand(command: string): string {
    return execSync(`cd ${testDir} && ${command}`, {
      timeout: 10000,
      encoding: "utf8",
      cwd: process.cwd(),
    });
  }

  test("Should format with tailwindcss plugin via CLI without infinite recursion", () => {
    const testFile = join(testDir, "test-cli-tailwind.js");
    const configFile = join(testDir, ".prettierrc.json");

    const code = `/**
* @param {String|Number} text - some text description



* @param {String} [defaultValue="defaultTest"] TODO
* @returns {Boolean} Description for returns
*/
const testFunction = (text, defaultValue) => true;
`;

    const prettierConfig = {
      semi: false,
      tabWidth: 2,
      printWidth: 100,
      singleQuote: true,
      plugins: ["prettier-plugin-tailwindcss", "prettier-plugin-jsdoc"],
    };

    writeFileSync(testFile, code);
    writeFileSync(configFile, JSON.stringify(prettierConfig, null, 2));

    const output = runCommand(
      `npx prettier --config ".prettierrc.json" "test-cli-tailwind.js"`,
    );

    expect(output).toBeDefined();
    expect(output).toMatchSnapshot();
  });

  test("Should format via CLI with --write flag", () => {
    const testFile = join(testDir, "test-cli-write.js");
    const configFile = join(testDir, ".prettierrc.json");

    const code = `/**
* @param {number} [arg1=123] the width



* @returns {void}
*/
function myFunc(arg1) {}
`;

    const prettierConfig = {
      semi: false,
      plugins: ["prettier-plugin-tailwindcss", "prettier-plugin-jsdoc"],
    };

    writeFileSync(testFile, code);
    writeFileSync(configFile, JSON.stringify(prettierConfig, null, 2));

    runCommand(
      `npx prettier --config ".prettierrc.json" --write "test-cli-write.js"`,
    );

    const formatted = readFileSync(testFile, "utf8");
    expect(formatted).toMatchSnapshot();
  });

  test("Should work with plugins in different orders via CLI", () => {
    const testFile = join(testDir, "test-cli-order.ts");
    const configFile = join(testDir, ".prettierrc.json");

    const code = `/**
 * @param {string} name




 * @returns {Promise<void>}
 */
async function example(name: string): Promise<void> {}
`;

    const configs = [
      ["prettier-plugin-jsdoc", "prettier-plugin-tailwindcss"],
      ["prettier-plugin-tailwindcss", "prettier-plugin-jsdoc"],
    ];

    configs.forEach((plugins) => {
      const prettierConfig = {
        parser: "typescript",
        plugins,
      };

      writeFileSync(testFile, code);
      writeFileSync(configFile, JSON.stringify(prettierConfig, null, 2));

      const output = runCommand(
        `npx prettier --config ".prettierrc.json" "test-cli-order.ts"`,
      );

      expect(output).toBeDefined();
      expect(output).toMatchSnapshot();
    });
  });
});
