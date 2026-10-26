import { defineConfig, devices } from '@playwright/test'

/**
 * Config separado do principal: `playwright.config.ts` sobe `build && preview`,
 * e o build de produção só tem `index.html` como entrada — os comps não existem
 * em `dist/`. Aqui rodamos contra o dev server, que serve `design/comps/*.html`
 * direto do disco.
 */
const port = 5174
const baseURL = `http://127.0.0.1:${port}`

export default defineConfig({
  testDir: './design/comps/checks',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  reporter: [['list']],
  use: { baseURL },
  webServer: {
    command: `pnpm dev --host 127.0.0.1 --port ${port} --strictPort`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
})
