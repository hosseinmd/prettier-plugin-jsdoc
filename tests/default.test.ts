import prettier from "prettier";
import { AllOptions } from "../src/types";

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

test("default value empty array", () => {
  const input = `
  /**
   * The summary
   *
   * @defaultValue []
   */
`
  const result = subject(input);

  expect(result).toMatchSnapshot();
});

test("default value empty object", () => {
  const input = `
  /**
   * The summary
   *
   * @defaultValue {}
   */
`
  const result = subject(input);

  expect(result).toMatchSnapshot();
});

test("default empty array in square-bracket boilerplate", () => {
  const input = `
  /**
   * The summary
   *
   * @default [[]]
   */
`
  const result = subject(input);

  expect(result).toMatchSnapshot();
});

test("default empty object in square-bracket boilerplate", () => {
  const input = `
  /**
   * The summary
   *
   * @default [{}]
   */
`
  const result = subject(input);

  expect(result).toMatchSnapshot();
});

test("default filled array", () => {
  const input = `
  /**
   * The summary
   *
   * @default [1,'two',{three:true},['four']]
   */
`
  const result = subject(input);

  expect(result).toMatchSnapshot();
});

test("default filled object", () => {
  const input = `
  /**
   * The summary
   *
   * @default {object:'value',nestingTest:{obj:'nested'}}
   */
`
  const result = subject(input);

  expect(result).toMatchSnapshot();
});

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

test("default with [square brackets boilerplate]", () => {
  const input = `
  /**
   * The summary
   *
   * @default [true]
   * @default [{object:'value',nestingTest:{obj:'nested'}}]
   * @default [[1,'two',{three:true},['four']]]
   */
`
  const result = subject(input);

  expect(result).toMatchSnapshot();
});
