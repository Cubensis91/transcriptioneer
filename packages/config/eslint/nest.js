// @ts-check
const base = require("./base");

/** @type {import("eslint").Linter.Config[]} */
module.exports = [
  ...base,
  {
    rules: {
      // Nest relies heavily on decorators + DI; constructor-injected params
      // and provider classes commonly use `any` at integration boundaries.
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-extraneous-class": "off",
    },
  },
];
