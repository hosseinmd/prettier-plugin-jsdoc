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
   * The value
   *
   * @default "type" name description
   */
`);

  expect(result).toMatchSnapshot();
});

test("default empty array", () => {
  const input = `
  /**
   * The value
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
   * The value
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
   * The value
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
   * The value
   *
   * @defaultValue {}
   */
`
  const result = subject(input);

  expect(result).toMatchSnapshot();
});

test("default filled array", () => {
  const input = `
  /**
   * The value
   *
   * @default [ 1, 'two', { three: true } ]
   */
`
  const result = subject(input);

  expect(result).toMatchSnapshot();
});

test("default filled object", () => {
  const input = `
  /**
   * The value
   *
   * @default { one: 1, two: '2' }
   */
`
  const result = subject(input);

  expect(result).toMatchSnapshot();
});

test("double default one", () => {
  const input = `
  /**
   * The value
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
   * The value
   *
   * @default {}
   * @default "something"
   */
`
  const result = subject(input);

  expect(result).toMatchSnapshot();
});
