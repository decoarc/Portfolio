import { Link } from 'react-router'
import { localePath } from '../lib/locale.ts'
import { useContent, useLocale } from './LocaleContext.ts'
import { useRouteHead } from './useRouteHead.ts'
import styles from './NotFoundRoute.module.css'

export function NotFoundRoute() {
  const locale = useLocale()
  useRouteHead({ locale, page: 'notFound' })
  const { site } = useContent()
  return (
    <div className={styles.page}>
      <h1 className={styles.title}>{site.notFound.title}</h1>
      <p className={styles.body}>{site.notFound.body}</p>
      <Link to={localePath(locale, '/')} className={styles.home}>
        {site.notFound.homeLabel}
      </Link>
    </div>
  )
}
