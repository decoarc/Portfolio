import { createContext, useContext } from 'react'
import { getContent } from '../content/index.ts'
import type { Locale, LocaleContent } from '../content/types.ts'

export const LocaleContext = createContext<Locale | null>(null)

export function useLocale(): Locale {
  const locale = useContext(LocaleContext)
  if (locale === null) throw new Error('useLocale fora de <LocaleLayout>')
  return locale
}

export function useContent(): LocaleContent {
  return getContent(useLocale())
}
