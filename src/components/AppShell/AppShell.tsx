import type { ReactNode } from 'react'
import { Link, useLocation } from 'react-router'
import type { SiteContent } from '@/content/types'
import { SkipLink } from '@/components/SkipLink'
import { useActiveSection } from '@/hooks'
import styles from './AppShell.module.css'

interface AppShellProps {
  content: SiteContent
  children: ReactNode
}

const SECTION_IDS = ['work', 'about', 'contact']

function sectionIdFromHref(href: string): string {
  const hash = href.includes('#') ? href.slice(href.indexOf('#') + 1) : href.replace(/^\//, '')
  return hash
}

export function AppShell({ content, children }: AppShellProps) {
  const location = useLocation()
  const onHome = location.pathname === '/'
  const professionalSocial = content.social.filter(
    (item) => item.professionalDefault !== false,
  )
  const activeSection = useActiveSection(onHome ? SECTION_IDS : [])

  return (
    <div className={styles.shell}>
      <SkipLink label={content.shell.skipToContent} />
      <header className={styles.header}>
        <div className={`u-container ${styles.headerInner}`}>
          <Link
            className={styles.brand}
            to="/"
            aria-label={content.person.name}
          >
            <span className={styles.brandMark} aria-hidden="true">
              AA
            </span>
            <span className={styles.brandName}>{content.person.name}</span>
          </Link>
          <nav className={styles.nav} aria-label="Primary">
            <ul className={styles.navList}>
              {content.nav.map((item) => {
                const id = sectionIdFromHref(item.href)
                const isActive = onHome && activeSection === id
                return (
                  <li key={item.href}>
                    <a
                      href={item.href}
                      className={isActive ? styles.navActive : undefined}
                      aria-current={isActive ? 'true' : undefined}
                    >
                      {item.label}
                    </a>
                  </li>
                )
              })}
            </ul>
          </nav>
        </div>
      </header>
      <main id="main" className={styles.main} tabIndex={-1}>
        {children}
      </main>
      <footer className={styles.footer}>
        <div className={`u-container ${styles.footerInner}`}>
          <p className="meta">{content.shell.footerNote}</p>
          <ul className={styles.social}>
            {professionalSocial.map((item) => (
              <li key={item.id}>
                <a
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </footer>
    </div>
  )
}
