import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // Structural enforcement of the server-only boundary: @transcriptioneer/ai
    // wraps the OpenAI SDK and secrets, and must never reach this client bundle.
    // Backed up at build time by the `server-only` import inside packages/ai.
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "@transcriptioneer/ai",
              message:
                "packages/ai is server-only and must not be imported from web client code.",
            },
          ],
        },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
