// End-to-end smoke tests: a real browser clicking through the built app.
// Run with: npm run test:e2e   (builds first, then serves dist/ on port 4174)
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'tests/e2e',
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:4174',
    ...devices['Pixel 7'], // phone-sized, touch
  },
  webServer: {
    command: 'npm run preview -- --port 4174 --strictPort',
    url: 'http://localhost:4174',
    reuseExistingServer: false,
  },
});
