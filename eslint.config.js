// @ts-check
const base = require("./packages/config/eslint/base.js");

/** @type {import("eslint").Linter.Config[]} */
module.exports = [
  ...base,
  {
    // apps/web (eslint-config-next) and apps/api (Nest CLI's own
    // type-checked config, incl. `@typescript-eslint/no-explicit-any: off`)
    // each ship their own eslint.config.* and are linted with that as their
    // nearest config — this file never applies to them. apps/mobile is a
    // Milestone 1 placeholder with no real source yet.
    ignores: ["apps/web/**", "apps/api/**", "apps/mobile/**"],
  },
];
