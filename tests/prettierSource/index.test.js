const prettier = require("prettier");
const { readFileSync } = require("fs");
const { resolve } = require("path");

function subjectFiles(relativePath, options = {}) {
  const filepath = resolve(__dirname, relativePath);

  try {
    const code = readFileSync(filepath).toString();
    return prettier.format(code, {
      plugins: ["."],
      filepath,
      ...options,
    });
  } catch (error) {
    console.error(error);
  }
}

test("prettier files create-ignorer.js", () => {
  const result = subjectFiles("./files/create-ignorer.js");
  expect(result).toMatchSnapshot();
});
