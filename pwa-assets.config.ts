import {defineConfig} from '@vite-pwa/assets-generator/config';

export default defineConfig({
    preset: {
        transparent: {sizes: [192, 512], padding: 0.05},
        maskable: {sizes: [512], padding: 0.3, resizeOptions: {background: '#00bcd4'}},
        apple: {sizes: [180], padding: 0.05, resizeOptions: {background: '#00bcd4'}},
    },
    images: ['public/klokku-icon.svg'],
});
