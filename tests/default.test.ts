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

test("Empty default", () => {
  const result = subject(`
  /**
   * The value
   *
   * @default 'type' name description
   */
`);

  expect(result).toMatchSnapshot();
});
test("Empty default", () => {
  const result = subject(`
  /**
   * The value
   *
   * @default []
   */
`);

  expect(result).toMatchSnapshot();
});
