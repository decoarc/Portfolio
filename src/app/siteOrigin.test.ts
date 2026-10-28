import { describe, expect, it } from 'vitest'
import { resolveSiteOrigin } from './siteOrigin.ts'

describe('resolveSiteOrigin', () => {
  it('remove a barra final', () => {
    expect(resolveSiteOrigin('https://exemplo.dev/')).toBe(
      'https://exemplo.dev',
    )
  })

  it('falha dizendo o que definir quando falta ou não é URL http(s)', () => {
    expect(() => resolveSiteOrigin(undefined)).toThrow(/VITE_SITE_ORIGIN/)
    expect(() => resolveSiteOrigin('')).toThrow(/VITE_SITE_ORIGIN/)
    expect(() => resolveSiteOrigin('exemplo.dev')).toThrow(/VITE_SITE_ORIGIN/)
    expect(() => resolveSiteOrigin('ftp://exemplo.dev')).toThrow(
      /VITE_SITE_ORIGIN/,
    )
  })
})
