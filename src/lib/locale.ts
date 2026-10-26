import type { Locale } from '../content/types.ts'

export const locales: readonly Locale[] = ['en', 'pt']

export function htmlLang(locale: Locale): 'en' | 'pt-BR' {
  return locale === 'pt' ? 'pt-BR' : 'en'
}

/** `path` começa com `/` e pode carregar `#hash`. EN fica na raiz; PT sob `/pt`. */
export function localePath(locale: Locale, path: string): string {
  if (locale === 'en') return path
  if (path === '/') return '/pt'
  // '/#work' vira '/pt#work', sem a barra sobrando
  return path.startsWith('/#') ? `/pt${path.slice(1)}` : `/pt${path}`
}

export function parseLocalePath(pathname: string): { locale: Locale; path: string } {
  if (pathname === '/pt' || pathname === '/pt/') return { locale: 'pt', path: '/' }
  if (pathname.startsWith('/pt/')) return { locale: 'pt', path: pathname.slice(3) }
  return { locale: 'en', path: pathname }
}

export function switchLocalePath(pathname: string, hash: string, target: Locale): string {
  const { path } = parseLocalePath(pathname)
  return localePath(target, `${path}${hash}`)
}
