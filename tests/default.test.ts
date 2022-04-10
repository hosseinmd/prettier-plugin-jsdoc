import prettier from "prettier";
import { AllOptions } from "../src/types";
import { DEFAULT, DEFAULT_Value, DEFAULT_value } from "../src/tags";

function subject(code: string, options: Partial<AllOptions> = {}) {
  return prettier.format(code, {
    parser: "babel",
    plugins: ["."],
    jsdocSpaces: 1,
    ...options,
  } as AllOptions);
}

test("default string with description", () => {
  const result = subject(`
  /**
   * The summary
   *
   * @default "type" description
   */
`);

  expect(result).toMatchSnapshot();
});

test("convert double quote @default to single quote", () => {
  const result = subject(`
  /**
   * The summary
   *
   * @default "value"
   */
`, { singleQuote: true });

  expect(result).toMatchSnapshot();
});

test("convert single quote @default to double quote", () => {
  const result = subject(`
  /**
   * The summary
   *
   * @default 'value'
   */
`, { singleQuote: false });

  expect(result).toMatchSnapshot();
});

test("Can't convert double quote @default if a single quote character is in the string", () => {
  const result = subject(`
  /**
   * The summary
   *
   * @default "This isn't bad"
   */
`, { singleQuote: true });

  expect(result).toMatchSnapshot();
});

test("default empty array", () => {
  const input = `
  /**
   * The summary
   *
   * @default []
   */
`
  const result = subject(input);

  expect(result).toMatchSnapshot();
});

test("default empty object", () => {
  const input = `
  /**
   * The summary
   *
   * @default {}
   */
`
  const result = subject(input);

  expect(result).toMatchSnapshot();
});

test("empty default tag", () => {
  const input = `
  /**
   * The summary
   *
   * @default
   */
`
  const result = subject(input);

  expect(result).toMatchSnapshot();
});

[DEFAULT, DEFAULT_Value, DEFAULT_value].forEach((tag: string) => {
  test(`@${tag} filled array`, () => {
    const input = `
    /**
     * The summary
     *
     * @${tag} [1,'two',{three:true},['four']]
     */
  `
    const result = subject(input);

    expect(result).toMatchSnapshot();
  });

  test(`@${tag} filled object`, () => {
    const input = `
    /**
     * The summary
     *
     * @${tag} {object:'value',nestingTest:{obj:'nested'}}
     */
  `
    const result = subject(input);

    expect(result).toMatchSnapshot();
  });
})

test("double default one", () => {
  const input = `
  /**
   * The summary
   *
   * @default "something"
   * @default {}
   */
`
  const result = subject(input);

  expect(result).toMatchSnapshot();
});

test("double default two", () => {
  const input = `
  /**
   * The summary
   *
   * @default {}
   * @default "something"
   */
`
  const result = subject(input);

  expect(result).toMatchSnapshot();
});
