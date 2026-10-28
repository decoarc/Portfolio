import type { Plugin } from 'vite'
import fs from 'node:fs'
import path from 'node:path'

/**
 * Mimics how Cloudflare Pages serves a static `dist/` so e2e sees what
 * production serves. Behaviour confirmed with `wrangler pages dev`
 * (design §5.2).
 */

export type Redirect = { from: string; to: string; status: number }
export type HeaderRule = { pattern: string; headers: Record<string, string> }
export type PagesResult =
  | { file: string; status: 200 | 404 }
  | { redirect: string; status: 301 | 302 | 308 }

export function parseRedirects(text: string): Redirect[] {
  const rules: Redirect[] = []
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim()
    if (!line || line.startsWith('#')) continue
    const [from, to, status] = line.split(/\s+/)
    if (!from || !to) continue
    rules.push({ from, to, status: status ? Number(status) : 302 })
  }
  return rules
}

export function parseHeaders(text: string): HeaderRule[] {
  const rules: HeaderRule[] = []
  let current: HeaderRule | null = null
  for (const raw of text.split(/\r?\n/)) {
    if (!raw.trim() || raw.trim().startsWith('#')) continue
    if (/^\s/.test(raw)) {
      const i = raw.indexOf(':')
      if (!current || i < 0) continue
      current.headers[raw.slice(0, i).trim()] = raw.slice(i + 1).trim()
    } else {
      current = { pattern: raw.trim(), headers: {} }
      rules.push(current)
    }
  }
  return rules
}

function matches(pattern: string, urlPath: string): boolean {
  const re = pattern
    .split('*')
    .map((part) => part.replace(/[.+?^${}()|[\]\\]/g, '\\$&'))
    .join('.*')
  return new RegExp(`^${re}$`).test(urlPath)
}

export function headersFor(
  rules: HeaderRule[],
  urlPath: string,
): Record<string, string> {
  const out: Record<string, string> = {}
  for (const rule of rules) {
    if (!matches(rule.pattern, urlPath)) continue
    for (const [name, value] of Object.entries(rule.headers)) {
      out[name] = name in out ? `${out[name]}, ${value}` : value
    }
  }
  return out
}

/** `urlPath` is the pathname without query string. */
export function resolvePagesRequest(
  urlPath: string,
  exists: (file: string) => boolean,
  redirects: Redirect[] = [],
): PagesResult {
  // 1. _redirects wins even when a file matches.
  for (const r of redirects) {
    if (r.status >= 300 && r.status < 400 && matches(r.from, urlPath)) {
      return { redirect: r.to, status: r.status as 301 | 302 }
    }
  }

  // Pages matches file names case-insensitively; try exact case first.
  const rel = urlPath.replace(/^\/+/, '')
  const find = (candidate: string): string | null => {
    if (exists(candidate)) return candidate
    const lower = candidate.toLowerCase()
    return exists(lower) ? lower : null
  }

  if (urlPath === '/') {
    const index = find('index.html')
    if (index) return { file: index, status: 200 }
  } else {
    // 2. Canonical URLs: no trailing slash, no .html.
    if (urlPath.endsWith('/')) {
      const bare = urlPath.replace(/\/+$/, '')
      const base = bare.replace(/^\/+/, '')
      if (find(`${base}.html`) || find(`${base}/index.html`)) {
        return { redirect: bare, status: 308 }
      }
    } else if (rel.endsWith('.html') && find(rel)) {
      const bare = urlPath.replace(/(\/index)?\.html$/, '') || '/'
      return { redirect: bare, status: 308 }
    }

    // 3. Exact file, <path>.html, <path>/index.html.
    for (const candidate of [rel, `${rel}.html`, `${rel}/index.html`]) {
      const hit = find(candidate)
      if (hit) return { file: hit, status: 200 }
    }
  }

  // 4. No root 404.html: SPA mode, everything goes to the home.
  if (!exists('404.html')) return { file: 'index.html', status: 200 }

  // 5. Nearest 404.html, climbing folders.
  const parts = rel.split('/').filter(Boolean)
  for (let depth = parts.length - 1; depth >= 0; depth--) {
    const candidate = `${parts.slice(0, depth).join('/')}${depth ? '/' : ''}404.html`
    const hit = find(candidate)
    if (hit) return { file: hit, status: 404 }
  }
  return { file: '404.html', status: 404 }
}

const MIME: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
}

export function pagesPreviewPlugin(): Plugin {
  return {
    name: 'portfolio-pages-preview',
    configurePreviewServer(server) {
      const outDir = path.resolve(
        server.config.root,
        server.config.build.outDir,
      )
      const read = (name: string) => {
        try {
          return fs.readFileSync(path.join(outDir, name), 'utf8')
        } catch {
          return ''
        }
      }
      const isFile = (file: string) => {
        try {
          return fs.statSync(path.join(outDir, file)).isFile()
        } catch {
          return false
        }
      }

      server.middlewares.use((req, res, next) => {
        if (req.method !== 'GET' && req.method !== 'HEAD') return next()
        if (!isFile('index.html')) return next()

        let urlPath: string
        try {
          urlPath = decodeURIComponent(
            new URL(req.url ?? '/', 'http://localhost').pathname,
          )
        } catch {
          return next()
        }
        if (urlPath.includes('..')) return next()

        // Read per request: the build can change while the server is up.
        const redirects = parseRedirects(read('_redirects'))
        const headerRules = parseHeaders(read('_headers'))
        const result = resolvePagesRequest(urlPath, isFile, redirects)

        if ('redirect' in result) {
          res.statusCode = result.status
          res.setHeader('Location', result.redirect)
          res.end()
          return
        }

        for (const [name, value] of Object.entries(
          headersFor(headerRules, urlPath),
        )) {
          res.setHeader(name, value)
        }
        res.statusCode = result.status
        res.setHeader(
          'Content-Type',
          MIME[path.extname(result.file).toLowerCase()] ??
            'application/octet-stream',
        )
        const full = path.join(outDir, result.file)
        res.setHeader('Content-Length', fs.statSync(full).size)
        if (req.method === 'HEAD') {
          res.end()
          return
        }
        fs.createReadStream(full).pipe(res)
      })
    },
  }
}
