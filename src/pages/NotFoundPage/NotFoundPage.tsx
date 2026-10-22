import { Link } from 'react-router'
import type { SiteContent } from '@/content/types'
import styles from './NotFoundPage.module.css'

interface NotFoundPageProps {
  site: SiteContent
}

export function NotFoundPage({ site }: NotFoundPageProps) {
  const { notFound } = site

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <p className={styles.meta} aria-hidden="true">
          404
        </p>
        <h1 className={styles.title}>{notFound.title}</h1>
        <p className={styles.body}>{notFound.body}</p>
        <p className={styles.actions}>
          <Link className={styles.homeLink} to="/">
            {notFound.homeLabel}
          </Link>
        </p>
      </div>
    </div>
  )
}
