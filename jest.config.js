// @ts-check

"use strict";

/** @type {import('@jest/types').Config.InitialOptions} */
const config = {
  preset: "ts-jest/presets/default-esm",
  globals: {
    "ts-jest": {
      useESM: true,
    },
  },
  moduleNameMapper: {
    "^(\\.{1,2}\\/.*)\\.js$": "$1",
  },
};

module.exports = config;
