const prettier = require("prettier");
const { readFileSync } = require("fs");
const { resolve } = require("path");

function subjectFiles(relativePath, options = {}) {
  const filepath = resolve(__dirname, relativePath);

  try {
    const code = readFileSync(filepath).toString();
    return subject(subject(code, filepath, options), filepath, options);
  } catch (error) {
    console.error(error);
  }
}

function subject(code, filepath, options) {
  return prettier.format(code, {
    plugins: ["."],
    jsdocSpaces: 1,
    trailingComma: "all",
    filepath,
    ...options,
  });
}

/**
 * source: https://github.com/PrismJS/prism/blob/266cc7002e54dae674817ab06a02c2c15ed64a6f/components/prism-core.js#L286
 * issue: https://github.com/hosseinmd/prettier-plugin-jsdoc/issues/25
 */
test("prism-core file", () => {
  const result = subjectFiles("./files/prismSource/prism-core.js");

  expect(result).toMatchSnapshot();
});
