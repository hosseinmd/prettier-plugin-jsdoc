import { format } from "prettier";
import { AllOptions } from "../src/types";

function subject(code: string, options: Partial<AllOptions> = {}) {
  return format(code, {
    parser: "babel",
    plugins: ["prettier-plugin-jsdoc"],
    ...options,
  } as AllOptions);
}

test("Description start with markdown", async () => {
  const result = await subject(
    `
  /**
   * Just a simple test
   *
   * @remarks 
   *   - Remark 1
   *   - Remark 2
   *   - Remark 3
   */
  `,
    {
      tsdoc: true,
    },
  );

  expect(result).toMatchSnapshot();

  const result2 = await subject(
    `
  /**
   * Just a simple test
   *
   * @remarks 
   *   - Remark 1
   *   - Remark 2
   *   - Remark 3
   */
  `,
    {
      tsdoc: false,
    },
  );

  expect(result2).toMatchSnapshot();
});
