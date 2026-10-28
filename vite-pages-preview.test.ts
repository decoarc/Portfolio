import { describe, expect, it } from 'vitest'
import {
  headersFor,
  parseHeaders,
  parseRedirects,
  resolvePagesRequest,
} from './vite-pages-preview.ts'

const FILES = [
  'index.html',
  'pt.html',
  'work/token-killer.html',
  'pt/work/map-areas.html',
  '404.html',
  'pt/404.html',
  'assets/x.js',
]
const redirects = parseRedirects('/pt/ /pt 301\n')
const exists = (files: string[]) => (f: string) => files.includes(f)
const resolve = (p: string) => resolvePagesRequest(p, exists(FILES), redirects)

describe('resolvePagesRequest (observado com wrangler pages dev)', () => {
  it('serves <path>.html without extension in the URL', () => {
    expect(resolve('/')).toEqual({ file: 'index.html', status: 200 })
    expect(resolve('/pt')).toEqual({ file: 'pt.html', status: 200 })
    expect(resolve('/pt/work/map-areas')).toEqual({
      file: 'pt/work/map-areas.html',
      status: 200,
    })
  })

  it('applies _redirects even when a file matches', () => {
    expect(resolve('/pt/')).toEqual({ redirect: '/pt', status: 301 })
  })

  it('is case-insensitive like Pages', () => {
    expect(resolve('/PT')).toEqual({ file: 'pt.html', status: 200 })
  })

  it('redirects a trailing slash and a .html suffix with 308', () => {
    expect(resolve('/work/token-killer/')).toEqual({
      redirect: '/work/token-killer',
      status: 308,
    })
    expect(resolve('/work/token-killer.html')).toEqual({
      redirect: '/work/token-killer',
      status: 308,
    })
  })

  it('serves exact files', () => {
    expect(resolve('/assets/x.js')).toEqual({
      file: 'assets/x.js',
      status: 200,
    })
  })

  it('serves <path>/index.html', () => {
    const r = resolvePagesRequest('/docs', exists(['docs/index.html']), [])
    expect(r).toEqual({ file: 'docs/index.html', status: 200 })
  })

  it('uses the nearest 404.html climbing folders', () => {
    expect(resolve('/pt/nada/fundo')).toEqual({
      file: 'pt/404.html',
      status: 404,
    })
    expect(resolve('/pt/nada')).toEqual({ file: 'pt/404.html', status: 404 })
    expect(resolve('/nada')).toEqual({ file: '404.html', status: 404 })
    expect(resolve('/assets/falta.js')).toEqual({
      file: '404.html',
      status: 404,
    })
  })

  it('falls back to index.html (SPA mode) when there is no root 404.html', () => {
    const spa = (p: string) =>
      resolvePagesRequest(p, exists(['index.html', 'pt.html']), [])
    expect(spa('/nada')).toEqual({ file: 'index.html', status: 200 })
    expect(spa('/pt/nada')).toEqual({ file: 'index.html', status: 200 })
    expect(spa('/pt')).toEqual({ file: 'pt.html', status: 200 })
  })
})

describe('parseRedirects', () => {
  it('parses from/to/status, skipping comments and blanks', () => {
    expect(
      parseRedirects('# c\n\n/a /b 301\n/c /d\n/* /index.html 200\n'),
    ).toEqual([
      { from: '/a', to: '/b', status: 301 },
      { from: '/c', to: '/d', status: 302 },
      { from: '/*', to: '/index.html', status: 200 },
    ])
  })
})

describe('parseHeaders / headersFor', () => {
  it('merges every matching rule; * at the end matches any suffix', () => {
    const rules = parseHeaders('/*\n  X-A: 1\n/assets/*\n  X-B: 2\n')
    expect(rules).toEqual([
      { pattern: '/*', headers: { 'X-A': '1' } },
      { pattern: '/assets/*', headers: { 'X-B': '2' } },
    ])
    expect(headersFor(rules, '/assets/a.js')).toEqual({
      'X-A': '1',
      'X-B': '2',
    })
    expect(headersFor(rules, '/pt')).toEqual({ 'X-A': '1' })
  })

  it('keeps colons inside values', () => {
    const rules = parseHeaders('/*\n  Content-Security-Policy: img-src data:\n')
    expect(headersFor(rules, '/')).toEqual({
      'Content-Security-Policy': 'img-src data:',
    })
  })
})
