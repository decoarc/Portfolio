import { createHash } from 'node:crypto'

/** Hash de CSP de um script inline: `'sha256-' + base64(sha256(texto))`. */
export function scriptHash(source: string): string {
  return 'sha256-' + createHash('sha256').update(source).digest('base64')
}

/**
 * Conteúdo do `_headers` do Cloudflare Pages (design §6). `scriptHashes` são
 * os hashes dos scripts inline do HTML; nada além deles roda inline.
 */
export function buildHeaders(scriptHashes: string[]): string {
  const scripts = ["'self'", ...scriptHashes.map((h) => `'${h}'`)].join(' ')
  const csp = [
    "default-src 'self'",
    `script-src ${scripts}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data:",
    "font-src 'self'",
    "base-uri 'self'",
    "form-action 'none'",
    "frame-ancestors 'none'",
  ].join('; ')
  return `/*
  Content-Security-Policy: ${csp}
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()

/assets/*
  Cache-Control: public, max-age=31536000, immutable
`
}
