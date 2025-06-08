import path from 'path';
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import checker from 'vite-plugin-checker';
import federation from '@originjs/vite-plugin-federation';

//import { devProxy } from './vite.dev.config';

const baseUrl = 'https://mizrahi-web-route-devops-tools.apps.cluster01.dev-hdigital.cloud.umtb.co.il';

export default defineConfig({
    test: {  globals: true,  environment: 'jsdom',  setupFiles: ['./vitest.setup.ts'],},
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
        {<FEDERATION>}
    ],

    resolve: {
        alias: {
            '@mfe-{<MFE NAME>}': path.resolve(__dirname, 'src'),
            '@api': path.resolve(__dirname, 'src/api'),
            '@components': path.resolve(__dirname, 'src/components'),
            '@apiMethods': path.resolve(__dirname, 'src/infrastructure/axios/'),
            '@utils': path.resolve(__dirname, 'src/utils/'),
            '@modals': path.resolve(__dirname, 'src/models/'),
        },
    },

    build: {
        sourcemap: false,
        modulePreload: false,
        target: 'esnext',
        minify: false,
        cssCodeSplit: false,
        rollupOptions: {
            external: ['**/*.test.tsx'],
            output: {
                entryFileNames: '[name].js',
                chunkFileNames: '[name].js',
            },
        },
    },

    server: {
        // For serving the module as a standalone app in dev mode
        port: {<SERVER PORT>},
        cors: true,
        proxy: {
            ['/api/' + 'ADD HERE']: {
                target: baseUrl,
                changeOrigin: true,
                secure: false,
            },
            //...devProxy,
        },
    },

    preview: {
        // For serving the built module
        port: {<PREVIEW PORT>},
        cors: true,
        proxy: {
            ['/api/' + 'ADD HERE']: {
                target: baseUrl,
                changeOrigin: true,
                secure: false,
            },
        },
    },
});
