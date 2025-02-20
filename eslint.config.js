// Import the TypeScript parser so ESLint can understand TypeScript syntax.
import tsParser from "@typescript-eslint/parser";
// Import the TypeScript ESLint plugin to get TypeScript-specific rules.
import tsPlugin from "@typescript-eslint/eslint-plugin";
// Import the core ESLint recommended config for JavaScript (flat format).
import js from "@eslint/js";
// Import the React Refresh ESLint plugin and rename it for clarity.
import reactRefreshPlugin from "eslint-plugin-react-refresh";
// Import the React Hooks ESLint plugin to enforce correct hook usage.
import reactHooksPlugin from "eslint-plugin-react-hooks";
// Import the globals package to get pre-defined global variables for various environments.
import globals from "globals";
import { blankLineAfterClosing } from "./eslintCustom.mjs";

const customRulesPlugin = {
  rules: {
    "blank-line-after-closing": blankLineAfterClosing,
  },
};

export default [
  {
    // 1. Files: Specifies which files to lint.
    //    Here we target JavaScript, JSX, TypeScript, and TSX files.
    files: ["**/*.{js,jsx,ts,tsx}"],
    // 2. Language Options: Set up the parser and ECMAScript options.
    languageOptions: {
      // Use the imported TypeScript parser (an object with the required parse methods).
      parser: tsParser,
      parserOptions: {
        // Use ECMAScript 2020 syntax.
        ecmaVersion: 2020,
        // Specify module source type to allow import/export statements.
        sourceType: "module",
      },
      // Define global variables that are assumed to be available.
      // This prevents ESLint from flagging them as undefined.
      globals: {
        ...globals.browser, // For browser-specific globals like `window` or `document`.
        ...globals.node, // For Node.js globals like `process` or `__dirname`.
      },
    },
    // 3. Plugins: Add plugins to extend ESLint with additional rules.
    plugins: {
      "@typescript-eslint": tsPlugin,
      "react-refresh": reactRefreshPlugin,
      "react-hooks": reactHooksPlugin,
      "custom-rules": customRulesPlugin,
    },
    // 4. Rules: Define which linting rules to enforce.
    rules: {
      // Spread in the recommended JS rules.
      ...js.configs.recommended.rules,
      // Spread in the recommended rules from the TypeScript plugin.
      ...tsPlugin.configs.recommended.rules,
      // Enable the React Refresh rule to warn if non-component values are exported.
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      "react-hooks/rules-of-hooks": "error", // Checks rules of Hooks.
      "react-hooks/exhaustive-deps": "warn", // Checks effect dependencies.
      // ADD HERE ONLY - Custom rules can be added below.

      // Disallow explicit usage of the 'any' type to enforce strict type safety.
      "@typescript-eslint/no-explicit-any": "error",
      // Allow only console.warn and console.error, for example.
      "no-console": ["warn", { allow: ["warn", "error"] }],
      // Enforce that opening curly braces appear on the same line as their controlling statement.
      "brace-style": ["error", "1tbs", { allowSingleLine: false }],
      // Require curly braces for all control statements (e.g., if, for, while) to enforce clarity and prevent errors.
      curly: ["error", "all"],
      // Disallow function declarations, encouraging arrow functions instead.
      "no-restricted-syntax": [
        "error",
        {
          selector: "FunctionDeclaration",
          message: "Use arrow functions instead.",
        },
        {
          selector: "Property[key.name=/^padding/]",
          message: "Usage of padding (or its variants) is not allowed.",
        },
        {
          selector: "Property[key.name=/^margin/]",
          message: "Usage of margin (or its variants) is not allowed.",
        },
      ],
      // error if a block’s closing curly brace
      "custom-rules/blank-line-after-closing": "error",
    },
  },
];
