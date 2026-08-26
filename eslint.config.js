import js from "@eslint/js";
import eslintPluginPrettier from "eslint-plugin-prettier/recommended";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

const GAME_SLUGS = ["taber-square", "tabers-star", "eternity-ii"];

const platformBoundaryConfig = {
  files: ["src/platform/**/*.{ts,tsx}"],
  ignores: ["src/platform/games/registry.ts"],
  rules: {
    "no-restricted-imports": [
      "error",
      {
        patterns: [
          {
            group: ["@/games", "@/games/*"],
            message:
              "The platform must not depend on game slices. Only registry.ts may import manifests.",
          },
        ],
      },
    ],
  },
};

const gameBoundaryConfigs = GAME_SLUGS.map((slug) => {
  const others = GAME_SLUGS.filter((s) => s !== slug);
  return {
    files: [`src/games/${slug}/**/*.{ts,tsx}`],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: others.map((other) => ({
            group: [`@/games/${other}`, `@/games/${other}/*`],
            message: `Game slices must stay independent: do not import from "${other}".`,
          })),
        },
      ],
    },
  };
});

export default tseslint.config(
  { ignores: ["dist", ".output", ".vinxi"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "server-only",
              message:
                "TanStack Start does not use the Next.js `server-only` package. Rename the module to `*.server.ts` or mark it with `@tanstack/react-start/server-only`.",
            },
          ],
        },
      ],
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
  platformBoundaryConfig,
  ...gameBoundaryConfigs,
  eslintPluginPrettier,
);
