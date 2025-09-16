import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist"] },
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
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
  // Special configuration for Cypress files
  {
    files: ["cypress/**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-namespace": "off", // Allow namespaces in Cypress for type definitions
      "@typescript-eslint/no-explicit-any": "warn", // Allow any in tests but warn
    },
  },
  // Allow any types in test files, Supabase functions, service files, and components
  {
    files: [
      "**/*.test.{ts,tsx}", 
      "**/setupTests.ts", 
      "supabase/functions/**/*.ts",
      "src/lib/**/*.ts",
      "src/services/**/*.ts",
      "src/components/**/*.{ts,tsx}",
      "src/pages/**/*.{ts,tsx}",
      "src/hooks/**/*.ts"
    ],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-namespace": "off",
    },
  }
);
