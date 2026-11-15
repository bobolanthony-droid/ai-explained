import { fileURLToPath } from 'node:url';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { defineConfig } from 'vitest/config';
import pkg from './package.json' with { type: 'json' };
import { contentPlugin } from './scripts/vite-content-plugin.ts';

// Where the app is served from. '/' on Netlify or Cloudflare Pages; '/ai-explained/' on
// GitHub Pages. Set with the BASE_PATH environment variable (the deploy workflow does this).
const base = process.env.BASE_PATH ?? '/';

export default defineConfig({
  base,
  define: { __APP_VERSION__: JSON.stringify(pkg.version) },
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  plugins: [
    react(),
    tailwindcss(),
    contentPlugin(),
    VitePWA({
      // 'prompt' = never reload under the user's feet; we show "Update now" instead.
      registerType: 'prompt',
      includeAssets: ['favicon.ico', 'logo.svg', 'apple-touch-icon-180x180.png'],
      manifest: {
        name: 'AI Explained',
        short_name: 'AI Explained',
        description: 'A calm, plain-language guide to AI at work.',
        lang: 'en',
        start_url: base,
        scope: base,
        display: 'standalone',
        background_color: '#fffaf2',
        theme_color: '#fffaf2',
        icons: [
          { src: 'pwa-64x64.png', sizes: '64x64', type: 'image/png' },
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Precache the whole app (all languages) so it works fully offline.
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
        // ...but skip font files for alphabets we don't use.
        globIgnores: ['**/*{cyrillic,greek,vietnamese,latin-ext}*.woff2'],
        navigateFallback: `${base}index.html`,
        cleanupOutdatedCaches: true,
      },
    }),
  ],
  test: { include: ['tests/unit/**/*.test.ts'], environment: 'node' },
});
