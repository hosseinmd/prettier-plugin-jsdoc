import { execSync } from "child_process";
import { default as chalk } from "chalk";

const __TEST__ = process.argv.includes("--test");

function $(commands) {
  if (typeof commands === "string") {
    console.log(chalk.gray("$", commands));
    return execSync(commands).toString();
  }

  return commands.map((command) => {
    console.log(chalk.gray("$", commands));
    execSync(command).toString();
  });
}

const lint = "npm run clean && npm run lint && tsc --project tsconfig.json";

const bundleUmd =
  "rollup dist/index.js --file dist/index.umd.js --format umd --name sayHello";
const bundleUmdMin =
  "terser --ecma 6 --compress --mangle -o dist/index.umd.min.js -- dist/index.umd.js && gzip -9 -c dist/index.umd.min.js > dist/index.umd.min.js.gz";
const buildStats =
  "(echo '\\033[35;3m' ; cd dist && ls -lh index*.js | index*.gz | tail -n +2 | awk '{print $5,$9}')";

$(`${lint}`);
if (!__TEST__) {
  $(`${bundleUmd}`);
  $(`${bundleUmdMin}`);
  $(`${buildStats}`);
}
