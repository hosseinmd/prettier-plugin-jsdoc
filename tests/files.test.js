const prettier = require("prettier");
const { readFileSync } = require("fs");
const { resolve } = require("path");

function subjectFiles(relativePath, options = {}) {
  const filepath = resolve(__dirname, relativePath);

  try {
    const code = readFileSync(filepath).toString();
    return prettier.format(code, {
      plugins: ["."],
      jsdocSpaces: 1,
      trailingComma: "all",
      filepath,
      ...options,
    });
  } catch (error) {
    console.error(error);
  }
}

test("js file", () => {
  const result = subjectFiles("./files/typeScript.js");
  expect(result).toMatchSnapshot();
});

test("ts file", () => {
  const result = subjectFiles("./files/typeScript.ts");
  expect(result).toMatchSnapshot();
});

test("types file", () => {
  const result = subjectFiles("./files/types.ts");
  expect(result).toMatchSnapshot();
});
