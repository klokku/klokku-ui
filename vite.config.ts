import path from "path";
import react from '@vitejs/plugin-react-swc'
import {defineConfig} from 'vite'

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src")
        }
    },
    server: {
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
