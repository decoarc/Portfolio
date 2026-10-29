import { useLayoutEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router'
import { useContent, useLocale } from '../../app/LocaleContext.ts'
import { BASE_PATH } from '../../lib/basePath.ts'
import { htmlLang, localePath, switchLocalePath } from '../../lib/locale.ts'
import styles from './Masthead.module.css'

export function Masthead() {
  const locale = useLocale()
  const { site } = useContent()
  const { pathname, hash } = useLocation()
  const target = locale === 'en' ? 'pt' : 'en'
  // Link de página inteira: o `pathname` do router não tem o prefixo do site.
  const href = BASE_PATH + switchLocalePath(pathname, hash, target)
  const switchRef = useRef<HTMLAnchorElement>(null)

  // O HTML pré-renderizado não sabe o hash nem o caminho pedido (o 404 é um
  // arquivo só para qualquer caminho), e a hidratação não corrige atributo
  // divergente. Escreve o href real no DOM; o React já o tem como valor.
  useLayoutEffect(() => {
    if (switchRef.current?.getAttribute('href') !== href) {
      switchRef.current?.setAttribute('href', href)
    }
  }, [href])

  return (
    <header className={styles.masthead}>
      <Link to={localePath(locale, '/')} className={styles.mark}>
        {site.shell.homeMark}
      </Link>
      <a
        ref={switchRef}
        href={href}
        hrefLang={htmlLang(target)}
        lang={htmlLang(target)}
        className={styles.switch}
      >
        {site.shell.localeSwitch}
      </a>
    </header>
  )
}
