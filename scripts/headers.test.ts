// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { headersFor, parseHeaders } from '../vite-pages-preview.ts'
import { buildHeaders, scriptHash } from './headers.ts'

describe('scriptHash', () => {
  it('é sha256 em base64 do texto exato', () => {
    expect(scriptHash('x')).toBe(
      'sha256-LXEWQrcmsEQBYnyp+6wy9chTD7GQPMTbAiWHF5IaSIE=',
    )
  })
})

describe('buildHeaders', () => {
  const hash = scriptHash('x')
  const rules = parseHeaders(buildHeaders([hash]))

  it('põe a CSP exata e os cabeçalhos de segurança nas páginas', () => {
    const html = headersFor(rules, '/pt')
    expect(html['Content-Security-Policy']).toBe(
      `default-src 'self'; script-src 'self' '${hash}'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; base-uri 'self'; form-action 'none'; frame-ancestors 'none'`,
    )
    expect(html['X-Content-Type-Options']).toBe('nosniff')
    expect(html['Referrer-Policy']).toBe('strict-origin-when-cross-origin')
    expect(html['Permissions-Policy']).toBe(
      'camera=(), microphone=(), geolocation=()',
    )
  })

  it('aceita mais de um hash', () => {
    const csp = headersFor(
      parseHeaders(buildHeaders(['sha256-a', 'sha256-b'])),
      '/',
    )['Content-Security-Policy']
    expect(csp).toContain("script-src 'self' 'sha256-a' 'sha256-b';")
  })

  it('cacheia /assets para sempre e não as páginas', () => {
    expect(headersFor(rules, '/assets/a.js')['Cache-Control']).toBe(
      'public, max-age=31536000, immutable',
    )
    expect(headersFor(rules, '/pt')['Cache-Control']).toBeUndefined()
  })
})
