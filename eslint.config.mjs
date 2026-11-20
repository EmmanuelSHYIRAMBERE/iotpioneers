import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import tseslint from "typescript-eslint";

/**
 * Lint rules: Next.js core web vitals, typed TypeScript rules, no `any`, consistent type
 * imports, no floating promises, and the layer boundaries from the modular-architecture skill.
 */
export default defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "playwright-report/**",
    "test-results/**",
    ".lighthouseci/**",
    "coverage/**",
  ]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [tseslint.configs.recommendedTypeChecked],
    languageOptions: {
      parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/consistent-type-imports": ["error", { fixStyle: "inline-type-imports" }],
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/no-non-null-assertion": "error",
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      "import/no-cycle": "error",
      "import/no-restricted-paths": [
        "error",
        {
          zones: [
            { target: "./components/ui", from: ["./components/sections", "./components/layout", "./components/dashboard", "./components/shop", "./content", "./app"], message: "ui is generic: no sections, features or content." },
            { target: "./components/visuals", from: ["./components/sections", "./components/layout", "./app"], message: "Feature components take props; they do not import sections." },
            { target: "./components/dashboard", from: ["./components/sections", "./components/layout", "./app"], message: "Feature components take props; they do not import sections." },
            { target: "./components/shop", from: ["./components/sections", "./components/layout", "./app"], message: "Feature components take props; they do not import sections." },
            { target: "./lib", from: ["./components", "./app"], message: "lib is pure logic: no components." },
            { target: "./hooks", from: ["./components", "./app"], message: "hooks hold logic only." },
            { target: "./content", from: ["./components", "./app", "./lib", "./hooks"], message: "content holds typed data only." },
          ],
        },
      ],
    },
  },
  {
    files: ["tests/**/*.{ts,tsx}", "scripts/**/*.ts"],
    rules: {
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
    },
  },
  {
    files: ["**/*.{js,mjs,cjs}"],
    extends: [tseslint.configs.disableTypeChecked],
  },
]);
