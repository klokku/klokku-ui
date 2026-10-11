import path from "path";
import react from '@vitejs/plugin-react-swc'
import {defineConfig} from 'vite'
import {VitePWA} from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
    plugins: [react(), VitePWA({
        strategies: 'injectManifest',
        srcDir: 'src',
        filename: 'sw.ts',
        registerType: 'prompt',
        injectRegister: false,
        includeManifestIcons: false,
        injectManifest: {
            // The existing application bundle is larger than Workbox's 2 MiB default.
            maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
            globPatterns: ['assets/**/*.{js,css,svg,woff2,ttf}', 'offline.html', 'pwa-*.png', 'maskable-icon-*.png', 'apple-touch-icon-*.png', 'klokku-icon.svg'],
        },
        manifest: {
            id: '/',
            name: 'Klokku',
            short_name: 'Klokku',
            description: 'Track your time and balance your life.',
            start_url: '/',
            scope: '/',
            display: 'standalone',
            theme_color: '#00bcd4',
            background_color: '#ffffff',
            icons: [
                {src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'any'},
                {src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any'},
                {src: '/maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable'},
            ],
        },
    })],
    build: {
        rolldownOptions: {
            input: {
                app: path.resolve(__dirname, 'index.html'),
                offline: path.resolve(__dirname, 'offline.html'),
            },
        },
    },
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src")
        }
    },
    server: {
        allowedHosts: ["local.klokku.com"],
        port: 3000,
        proxy: {
            // Target is your backend API
            "/api": {
                target: "http://localhost:8181",
                changeOrigin: true,
            },
        },
    },
})
