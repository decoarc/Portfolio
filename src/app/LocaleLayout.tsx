import { useEffect } from 'react'
import { Outlet } from 'react-router'
import { Masthead } from '../components/Masthead/Masthead.tsx'
import { SkipLink } from '../components/SkipLink/SkipLink.tsx'
import { getContent } from '../content/index.ts'
import type { Locale } from '../content/types.ts'
import { htmlLang } from '../lib/locale.ts'
import { LocaleContext } from './LocaleContext.ts'
import styles from './LocaleLayout.module.css'
import { ScrollManager } from './ScrollManager.tsx'

export function LocaleLayout({ locale }: { locale: Locale }) {
  const { site } = getContent(locale)

  useEffect(() => {
    document.documentElement.lang = htmlLang(locale)
  }, [locale])

  return (
    <LocaleContext value={locale}>
      <SkipLink label={site.shell.skipToContent} />
      <Masthead />
      <main id="main" tabIndex={-1} className={styles.main}>
        <Outlet />
      </main>
      <footer className={styles.footer}>
        <p className={styles.note}>{site.shell.footerNote}</p>
      </footer>
      <ScrollManager />
    </LocaleContext>
  )
}
