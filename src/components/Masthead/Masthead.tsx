import { Link, useLocation } from 'react-router'
import { useContent, useLocale } from '../../app/LocaleContext.ts'
import { htmlLang, localePath, switchLocalePath } from '../../lib/locale.ts'
import styles from './Masthead.module.css'

export function Masthead() {
  const locale = useLocale()
  const { site } = useContent()
  const { pathname, hash } = useLocation()
  const target = locale === 'en' ? 'pt' : 'en'

  return (
    <header className={styles.masthead}>
      <Link to={localePath(locale, '/')} className={styles.mark}>
        {site.shell.homeMark}
      </Link>
      <a
        href={switchLocalePath(pathname, hash, target)}
        hrefLang={htmlLang(target)}
        lang={htmlLang(target)}
        className={styles.switch}
      >
        {site.shell.localeSwitch}
      </a>
    </header>
  )
}
