// @ts-check

"use strict";

/** @type {import('@jest/types').Config.InitialOptions} */
const config = {
  preset: 'ts-jest/presets/js-with-babel',
  globals: {
    "ts-jest": {
      useESM: true,
    },
  },
  moduleNameMapper: {
    "^(\\.{1,2}\\/.*)\\.js$": "$1",
  },
  transformIgnorePatterns: ['node_modules/(?!(mdast-util-from-markdown))/'],
};

module.exports = config;
