import * as prettier from "prettier";
import { AllOptions } from "../src/types";

function subject(code: string, options: Partial<AllOptions> = {}) {
  return prettier.format(code, {
    parser: "babel",
    plugins: ["prettier-plugin-jsdoc"],
    ...options,
  } as AllOptions);
}

test("Tag group", async () => {
  const result = await subject(
    `
  /**
   * Aliquip ex proident tempor eiusmod aliquip amet. Labore commodo nulla tempor
   * consequat exercitation incididunt non. Duis laboris reprehenderit proident
   * proident.
   * @see {@link http://acme.com}
   * @example
   *   const foo = 0;
   *   const a = "";
   *   const b = "";
   *
   * @param id A test id.
   * @throws Minim sit ad commodo ut dolore magna magna minim consequat. Ex
   *   consequat esse incididunt qui voluptate id voluptate quis ex et. Ullamco
   *   cillum nisi amet fugiat.
   * @return Minim sit a.
   */
  
`,
    {
      jsdocSeparateTagGroups: true,
    },
  );

  expect(result).toMatchSnapshot();
});
