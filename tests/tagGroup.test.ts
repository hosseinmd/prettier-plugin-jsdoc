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

test("space after unknownTag", async () => {
  function _subject(str: string) {
    return subject(str, {
      arrowParens: "always",
      bracketSameLine: false,
      bracketSpacing: true,
      embeddedLanguageFormatting: "auto",
      endOfLine: "lf",
      htmlWhitespaceSensitivity: "css",
      insertPragma: false,
      jsxSingleQuote: true,
      printWidth: 180,
      proseWrap: "preserve",
      quoteProps: "preserve",
      requirePragma: false,
      semi: true,
      singleAttributePerLine: false,
      singleQuote: true,
      tabWidth: 4,
      trailingComma: "all",
      useTabs: true,
      vueIndentScriptAndStyle: true,

      jsdocAddDefaultToDescription: false,
      jsdocCapitalizeDescription: true,
      jsdocDescriptionTag: false,
      jsdocDescriptionWithDot: true,
      jsdocKeepUnParseAbleExampleIndent: false,
      jsdocLineWrappingStyle: "greedy",
      jsdocPreferCodeFences: false,
      jsdocPrintWidth: 120,
      jsdocSeparateReturnsFromParam: false,
      jsdocSeparateTagGroups: true,
      jsdocSingleLineComment: false,
      jsdocSpaces: 1,
      jsdocVerticalAlignment: true,
      tsdoc: false,
    });
  }
  const result = await _subject(`
   /**
    * 
    * A description.
    *
    * @unknownTag A note.
    *
    * @see http://acme.com
    */
   `);

  expect(await _subject(await _subject(result))).toMatchSnapshot();
});

test("Inconsistant formatting", async () => {
  const result = await subject(
    `
    /**
     * Aliquip ex proident tempor eiusmod aliquip amet. Labore commodo nulla tempor
     * consequat exercitation incididunt non. Duis laboris reprehenderit proident
     * proident.
     *
     * @example
     *   const foo = 0;
     *
     *
     * @param id A test id.
     *
     * @throws Minim sit ad commodo ut dolore magna magna minim consequat. Ex
     *   consequat esse incididunt qui voluptate id voluptate quis ex et. Ullamco
     *   cillum nisi amet fugiat.
     * @see {@link http://acme.com}
     */
`,
    {
      jsdocSeparateTagGroups: true,
    },
  );

  expect(result).toMatchSnapshot();
});
