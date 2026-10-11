import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react-swc'
import {VitePWA} from 'vite-plugin-pwa'

export default defineConfig({
    plugins: [react(), VitePWA({registerType: 'prompt'})],
    test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: ['./src/setupTests.ts'],
        include: ['src/**/*.{test,spec}.{js,ts,jsx,tsx}'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            exclude: [
                'node_modules/',
                'src/setupTests.ts',
                'src/**/*.d.ts',
                'dist/'
            ]
        }
    },
    resolve: {
        alias: {
            '@': '/src',
            // react-router-dom re-exports react-router; use one module instance in tests.
            'react-router-dom': 'react-router'
        }
    }
});
