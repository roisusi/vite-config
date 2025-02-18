import tseslint from 'typescript-eslint';

export default tseslint.config(
    // Global configuration options (e.g., folders to ignore)
    {
        ignores: ['dist']  // Ignore the "dist" directory
    },
    {
        // "extends": an array of configurations to extend.
        // Leave it empty to start with a blank slate.
        extends: [],

        // "files": a glob pattern that specifies which files to lint.
        files: ['**/*.{ts,tsx,js,jsx}'],

        // "languageOptions": configuration for parser, ECMAScript version, globals, etc.
        languageOptions: {
            ecmaVersion: 2020,    // Use ECMAScript 2020 syntax
            sourceType: 'module', // Allow use of ECMAScript modules (import/export)
            globals: {
                // Define any global variables here. For now, it's empty.
            },
        },

        // "plugins": add any ESLint plugins you wish to use.
        // This is currently empty. You can add plugins as needed.
        plugins: {
            // Example:
            // 'react': require('eslint-plugin-react'),
            // 'react-hooks': require('eslint-plugin-react-hooks'),
        },

        // "rules": define your custom ESLint rules here.
        // Start with an empty object and add rules one by one.
        rules: {
            // Example rule to disallow explicit "any" (if you choose to enforce it later):
            '@typescript-eslint/no-explicit-any': 'error',
        },
    },
);
