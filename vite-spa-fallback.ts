import type { Connect, Plugin } from 'vite'
import fs from 'node:fs'
import path from 'node:path'

/**
 * Serve index.html for non-file navigations in Vite preview (and optionally
 * dev). Mirrors Cloudflare Pages `public/_redirects` SPA behavior locally so
 * hard refresh / direct deep links can be verified without deploying.
 */
export function spaFallbackPlugin(options?: {
  /** Also rewrite in `vite` / `vite --host` (default: preview only). */
  includeDev?: boolean
}): Plugin {
  const includeDev = options?.includeDev ?? false

  const attach = (
    middlewares: Connect.Server,
    root: string,
    outDir: string,
  ) => {
    middlewares.use((req, res, next) => {
      const url = req.url ?? '/'
      if (req.method !== 'GET' && req.method !== 'HEAD') {
        next()
        return
      }
      if (
        url.startsWith('/@') ||
        url.startsWith('/node_modules') ||
        url.includes('.')
      ) {
        next()
        return
      }

      const candidate = path.join(outDir, url === '/' ? 'index.html' : url)
      if (
        url !== '/' &&
        fs.existsSync(candidate) &&
        fs.statSync(candidate).isFile()
      ) {
        next()
        return
      }

      const indexHtml = path.join(root === outDir ? outDir : root, 'index.html')
      const builtIndex = path.join(outDir, 'index.html')
      const file = fs.existsSync(builtIndex) ? builtIndex : indexHtml
      if (!fs.existsSync(file)) {
        next()
        return
      }

      res.setHeader('Content-Type', 'text/html')
      res.statusCode = 200
      fs.createReadStream(file).pipe(res)
    })
  }

  return {
    name: 'portfolio-spa-fallback',
    configurePreviewServer(server) {
      const outDir = path.resolve(
        server.config.root,
        server.config.build.outDir,
      )
      attach(server.middlewares, server.config.root, outDir)
    },
    configureServer(server) {
      if (!includeDev) return
      attach(server.middlewares, server.config.root, server.config.root)
    },
  }
}
