import path from "path";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";

// ignore all bare imports from node_modules
// which are not relative and not absolute
const external = (id) =>
  id.startsWith(".") === false &&
  path.isAbsolute(id) === false;

export default {
  input: "./dist/index.js",
  output: {
    file: "dist/index.js",
    format: "esm",
  },
  external,
  plugins: [
    commonjs({}),
    nodeResolve({}),
    json({
      preferConst: true,
    }),
  ],
};
