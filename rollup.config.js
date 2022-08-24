import path from "path";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";

// ignore all bare imports from node_modules
// which are not relative and not absolute
const external = (id) =>
  !id.startsWith("mdast-util-from-markdown") &&
  !id.startsWith("mdast-util-to-string") &&
  !id.startsWith("micromark") &&
  !id.startsWith("decode-named-character-reference") &&
  !id.startsWith("character-entities") &&
  !id.startsWith("unist-util-stringify-position") &&
  id.startsWith(".") === false &&
  path.isAbsolute(id) === false;

export default {
  input: "./dist/index.js",
  output: {
    file: "dist/index.js",
    format: "commonjs",
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
