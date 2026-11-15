// Generates the PNG app icons from public/logo.svg. Run: npm run icons
import { defineConfig, minimal2023Preset } from '@vite-pwa/assets-generator/config';

const background = '#fffaf2';
export default defineConfig({
  preset: {
    ...minimal2023Preset,
    maskable: { sizes: [512], padding: 0.2, resizeOptions: { background } },
    apple: { sizes: [180], padding: 0.1, resizeOptions: { background } },
  },
  images: ['public/logo.svg'],
});
