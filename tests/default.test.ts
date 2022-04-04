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
   * @default 'type' name description
   */
`);

  expect(result).toMatchSnapshot();
});

test("default array", () => {
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

test("default object", () => {
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
