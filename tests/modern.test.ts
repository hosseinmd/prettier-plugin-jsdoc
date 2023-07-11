import * as prettier from "prettier";
import { AllOptions } from "../src/types";

function subject(code: string, options: Partial<AllOptions> = {}) {
  return prettier.format(code, {
    plugins: ["prettier-plugin-jsdoc"],
    parser: "typescript",
    jsdocSpaces: 1,
    ...options,
  } as AllOptions);
}

test("convert array to modern type", async () => {
  const result = await subject(`
  /**
   * @typedef {import("react-native-reanimated").default.Adaptable<number>} Adaptable
   * @param {Adaptable} animNode
   * @param {object} InterpolationConfig
   * @param {ReadonlyArray<Adaptable>} InterpolationConfig.inputRange Like [0,1]
   * @param {Array<string>} InterpolationConfig.outputRange Like ["#0000ff","#ff0000"]
   * @param {import("react-native-reanimated").default.Extrapolate} [InterpolationConfig.extrapolate]
   * @param {Array<Foo<Bar>>} arg1
   * @param {Array<(item: Foo<Bar>) => Bar<number>> | Array<number> | Array<string>} arg2
   * @param {Array.<(item: Foo.<Bar>) => Bar.<number>> | Array.<number> | Array.<'Foo.<>'>} arg3
   * @param {"Array.<(item: Foo.<Bar>) => Bar.<number>> | Array.<number> | Array.<'Foo.<>'>"} arg4
   * @param {Array<Array<Array<number>>>} arg5
   * @param {{ foo: Array<number>; bar: Array<string> }} arg6
   *
   */
  function a(){}
`);

  expect(result).toMatchSnapshot();
});
