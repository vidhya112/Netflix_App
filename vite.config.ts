import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import checker from 'vite-plugin-checker';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
    base: './',
    plugins: [

        react(),
        checker({
            typescript: true,
            overlay: {
                initialIsOpen: false,
                position: 'br',
            },
        }),
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    server: {
        port: 3000,
        open: true,
        watch: {
            usePolling: true,
            interval: 100,
        },
    },
});
