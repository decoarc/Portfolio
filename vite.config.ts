import path from 'node:path'
import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'
import { pagesPreviewPlugin } from './vite-pages-preview.ts'

const rootDir = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  // Preview mirrors how Cloudflare Pages serves dist; Vite dev already has history fallback.
  // `VITE_BASE_PATH` só é definido no deploy do GitHub Pages (`/Portfolio/`).
  base: process.env.VITE_BASE_PATH ?? '/',
  plugins: [react(), pagesPreviewPlugin()],
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
