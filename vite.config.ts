import path from 'node:path'
import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'
import { spaFallbackPlugin } from './vite-spa-fallback.ts'

const rootDir = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  // Preview mirrors Cloudflare `_redirects`; Vite dev already has history fallback.
  plugins: [react(), spaFallbackPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(rootDir, './src'),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
    css: true,
    exclude: ['**/node_modules/**', '**/e2e/**', '**/dist/**'],
  },
})
