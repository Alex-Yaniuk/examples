/* eslint-env node */
import { defineConfig, devices } from '@playwright/test'

const webServerHost = process.env.PLAYWRIGHT_WEB_SERVER_HOST ?? '127.0.0.1'
const webServerPort = Number(process.env.PLAYWRIGHT_WEB_SERVER_PORT ?? 5173)
const baseURL =
  process.env.PLAYWRIGHT_BASE_URL ?? `http://${webServerHost}:${webServerPort}`

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  outputDir: 'test-results',
  expect: {
    timeout: 5_000,
  },
  use: {
    baseURL,
    trace: process.env.CI ? 'on-first-retry' : 'retain-on-failure',
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  reporter: process.env.CI
    ? [['github'], ['html', { open: 'never' }]]
    : 'list',
  webServer: {
    command: `npm run dev -- --host ${webServerHost} --port ${webServerPort} --strictPort`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      ...process.env,
      VITE_GOOGLE_CLIENT_ID: '',
    },
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
})
