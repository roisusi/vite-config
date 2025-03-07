// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import checker from "vite-plugin-checker";
// @ts-ignore
import eslintPlugin from "vite-plugin-eslint";

export default defineConfig({
  plugins: [
    react(),
    checker({
      overlay: true,
      eslint: {
        useFlatConfig: true,
        lintCommand: 'eslint "src/**/*.{js,jsx,ts,tsx}"',
        dev: {
          logLevel: ["error"],
        },
      },
    }),
  ],
});
