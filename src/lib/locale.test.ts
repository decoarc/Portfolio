import { describe, expect, it } from 'vitest'
import {
  htmlLang,
  localePath,
  parseLocalePath,
  switchLocalePath,
} from './locale.ts'

describe('localePath', () => {
  it.each([
    ['en', '/', '/'],
    ['pt', '/', '/pt'],
    ['pt', '/work/map-areas', '/pt/work/map-areas'],
    ['pt', '/#work', '/pt#work'],
  ] as const)('localePath(%s, %s) = %s', (locale, path, esperado) => {
    expect(localePath(locale, path)).toBe(esperado)
  })
})

describe('parseLocalePath', () => {
  it.each([
    ['/pt', { locale: 'pt', path: '/' }],
    ['/pt/', { locale: 'pt', path: '/' }],
    ['/pt/work/x', { locale: 'pt', path: '/work/x' }],
    ['/ptx', { locale: 'en', path: '/ptx' }],
    ['/work/x', { locale: 'en', path: '/work/x' }],
  ] as const)('parseLocalePath(%s)', (pathname, esperado) => {
    expect(parseLocalePath(pathname)).toEqual(esperado)
  })
})

describe('switchLocalePath', () => {
  it.each([
    ['/work/x', '', 'pt', '/pt/work/x'],
    ['/pt/work/x', '', 'en', '/work/x'],
    ['/pt', '#work', 'en', '/#work'],
    ['/nao-existe', '', 'pt', '/pt/nao-existe'],
  ] as const)(
    'switchLocalePath(%s, %s, %s) = %s',
    (pathname, hash, target, esperado) => {
      expect(switchLocalePath(pathname, hash, target)).toBe(esperado)
    },
  )
})

describe('htmlLang', () => {
  it('mapeia pt para pt-BR e en para en', () => {
    expect(htmlLang('pt')).toBe('pt-BR')
    expect(htmlLang('en')).toBe('en')
  })
})
