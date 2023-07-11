import * as prettier from "prettier";
import { AllOptions } from "../src/types";

function subject(code: string, options: Partial<AllOptions> = {}) {
  return prettier.format(code, {
    parser: "babel",
    plugins: ["prettier-plugin-jsdoc"],
    jsdocSpaces: 1,
    ...options,
  } as AllOptions);
}

test("default string with description", async () => {
  const result = await subject(`
  /**
   * The summary
   *
   * @default "type" description
   */
`);

  expect(result).toMatchSnapshot();
});

test("convert double quote @default to single quote", async () => {
  const result = await subject(`
  /**
   * The summary
   *
   * @default "value"
   */
`, { singleQuote: true });

  expect(result).toMatchSnapshot();
});

test("convert single quote @default to double quote", async () => {
  const result = await subject(`
  /**
   * The summary
   *
   * @default 'value'
   */
`, { singleQuote: false });

  expect(result).toMatchSnapshot();
});

test("Can't convert double quote @default if a single quote character is in the string", async () => {
  const result = await subject(`
  /**
   * The summary
   *
   * @default "This isn't bad"
   */
`, { singleQuote: true });

  expect(result).toMatchSnapshot();
});

test("default empty array", async () => {
  const input = `
  /**
   * The summary
   *
   * @default []
   */
`
  const result = await subject(input);

  expect(result).toMatchSnapshot();
});

test("default empty object", async () => {
  const input = `
  /**
   * The summary
   *
   * @default {}
   */
`
  const result = await subject(input);

  expect(result).toMatchSnapshot();
});

test("empty default tag", async () => {
  const input = `
  /**
   * The summary
   *
   * @default
   */
`
  const result = await subject(input);

  expect(result).toMatchSnapshot();
});

['default', 'defaultValue'].forEach((tag: string) => {
  test(`@${tag} filled array`, async () => {
    const input = `
    /**
     * The summary
     *
     * @${tag} [1,'two',{three:true},['four']]
     */
  `
    const result = await subject(input);

    expect(result).toMatchSnapshot();
  });

  test(`@${tag} filled object`, async () => {
    const input = `
    /**
     * The summary
     *
     * @${tag} {object:'value',nestingTest:{obj:'nested'}}
     */
  `
    const result = await subject(input);

    expect(result).toMatchSnapshot();
  });
})

test("double default one", async () => {
  const input = `
  /**
   * The summary
   *
   * @default "something"
   * @default {}
   */
`
  const result = await subject(input);

  expect(result).toMatchSnapshot();
});

test("double default two", async () => {
  const input = `
  /**
   * The summary
   *
   * @default {}
   * @default "something"
   */
`
  const result = await subject(input);

  expect(result).toMatchSnapshot();
});
