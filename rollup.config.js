import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";

export default {
  input: "dist/index.js",
  output: {
    file: "dist/index.js",
    format: "commonjs",
  },
  external: ["prettier", "comment-parser", "binary-searching"],
  plugins: [
    commonjs({}),
    nodeResolve({}),
    json({
      preferConst: true,
    }),
  ],
};
