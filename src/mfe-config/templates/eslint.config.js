// Import the TypeScript parser so ESLint can understand TypeScript syntax.
import tsParser from '@typescript-eslint/parser';

// Import the TypeScript ESLint plugin to get TypeScript-specific rules.
import tsPlugin from '@typescript-eslint/eslint-plugin';

// Import the core ESLint recommended config for JavaScript (flat format).
import js from '@eslint/js';

// Import the React Refresh ESLint plugin and rename it for clarity.
import reactRefreshPlugin from 'eslint-plugin-react-refresh';

// Import the React Hooks ESLint plugin to enforce correct hook usage.
import reactHooksPlugin from 'eslint-plugin-react-hooks';

// Import the React plugin for React-specific linting rules.
import reactPlugin from "eslint-plugin-react";

// Import the JSX Accessibility plugin for enforcing accessible JSX practices.
import jsxA11y from "eslint-plugin-jsx-a11y";

// Import the globals package to get pre-defined global variables for various environments.
import globals from 'globals';

// Import custom ESLint rules
import {
    blankLineAfterClosing,
    noHexColor,
    requireTodoInComments,
    requireUnionTypeInAlias,
} from './eslintCustom.mjs';

const customRulesPlugin = {
    rules: {
        'blank-line-after-closing': blankLineAfterClosing,
        'require-todo-in-comments': requireTodoInComments,
        'require-union-type-in-alias': requireUnionTypeInAlias,
        'no-hex-color': noHexColor,
    },
};

export default [
    {
        // 0. Ignore Files.
        ignores: [
            '**/dist/*',
            '**/vite.config.ts',
            '**/vite.dev.config.ts',
            '**/eslint.config.js',
            '**/eslintCustom.mjs',
            '**/vite-env.d.ts',
        ],
    },
    {
        // 1. Files: Specifies which files to lint.
        //    Here we target JavaScript, JSX, TypeScript, and TSX files.
        files: ['**/*.{js,jsx,ts,tsx}'],

        // 2. Language Options: Set up the parser and ECMAScript options.
        languageOptions: {
            // Use the imported TypeScript parser (an object with the required parse methods).
            parser: tsParser,
            parserOptions: {
                // Use ECMAScript 2020 syntax.
                ecmaVersion: 2020,
                // Specify module source type to allow import/export statements.
                sourceType: 'module',
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
            '@typescript-eslint': tsPlugin,
            'react-refresh': reactRefreshPlugin,
            'react-hooks': reactHooksPlugin,
            react: reactPlugin,
            "jsx-a11y": jsxA11y,
            'custom-rules': customRulesPlugin,
        },

        // 4. Rules: Define which linting rules to enforce.
        rules: {
            // Spread in the recommended JS rules.
            ...js.configs.recommended.rules,
            
            // Spread in the recommended rules from the TypeScript plugin.
            ...tsPlugin.configs.recommended.rules,

            // React and React Hooks rules
            'react-refresh/only-export-components': [
                'warn',
                { allowConstantExport: true },
            ],
            'react-hooks/rules-of-hooks': 'error', // Checks rules of Hooks
            'react-hooks/exhaustive-deps': 'warn', // Checks effect dependencies
            "react/jsx-uses-react": "error",
            "react/jsx-uses-vars": "error",
            
            // Accessibility rules
            "jsx-a11y/alt-text": "error",

            // ADD HERE ONLY - Custom rules can be added below.
            
            // TypeScript specific rules
            '@typescript-eslint/no-explicit-any': 'error', // Disallow explicit usage of the 'any' type to enforce strict type safety.

            // Console usage rules
            'no-console': ['warn', { allow: ['warn', 'error'] }], // Allow only console.warn and console.error

            // Code style rules
            'brace-style': ['error', '1tbs', { allowSingleLine: false }], // Enforce that opening curly braces appear on the same line as their controlling statement.
            'curly': ['error', 'all'], // Require curly braces for all control statements

            // Syntax restrictions
            'no-restricted-syntax': [
                'error',
                {
                    selector: 'FunctionDeclaration',
                    message: 'Use arrow functions instead.',
                },
                // {
                //     selector: "Property[key.name=/^padding/]",
                //     message: "Usage of padding (or its variants) is not allowed.",
                // },
                {
                    selector: 'Property[key.name=/^margin/]',
                    message: 'Usage of margin (or its variants) is not allowed.',
                },
            ],

            // Custom rules
            'custom-rules/blank-line-after-closing': 'error',
            'custom-rules/require-todo-in-comments': 'error',
            'custom-rules/require-union-type-in-alias': 'error',
            'custom-rules/no-hex-color': 'error',

            // Import restrictions
            'no-restricted-imports': [
                'error',
                {
                    patterns: ['../../**', '*.ts', '*.tsx'],
                },
            ],
        },
    },
];