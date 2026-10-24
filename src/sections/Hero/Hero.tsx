import type { SiteContent } from '@/content/types'
import styles from './Hero.module.css'

interface HeroProps {
  site: SiteContent
}

function splitPersonName(fullName: string): { first: string; rest: string } {
  const parts = fullName.trim().split(/\s+/)
  if (parts.length === 1) {
    return { first: parts[0], rest: '' }
  }
  return { first: parts[0], rest: parts.slice(1).join(' ') }
}

/**
 * M2a first-viewport — Gate B refinement.
 * Ledger type on paper; surname + title-block live in the Cut field.
 */
export function Hero({ site }: HeroProps) {
  const { first, rest } = splitPersonName(site.person.name)
  const { ctaPrimary, ctaSecondary, plateAnnotation, plateFocusLabel, plateFocus } =
    site.hero

  return (
    <section className={styles.hero} aria-labelledby="home-name">
      <div className={styles.stage}>
        <div className={styles.field} aria-hidden="true" />

        <h1 id="home-name" className={styles.name}>
          <span className={styles.nameFirst}>{first}</span>
          {rest ? <span className={styles.nameRest}>{rest}</span> : null}
        </h1>

        <div className={styles.copy}>
          <p className={styles.role}>{site.person.role}</p>
          <p className={styles.pov}>{site.person.shortBio}</p>
          <div className={styles.ctaGroup}>
            <a className={styles.ctaPrimary} href={ctaPrimary.href}>
              {ctaPrimary.label}
            </a>
            <a className={styles.ctaSecondary} href={ctaSecondary.href}>
              {ctaSecondary.label}
            </a>
          </div>
        </div>

        <aside className={styles.plate}>
          <div className={styles.plateHead}>
            <span className={styles.plateSigil} aria-hidden="true">
              AA
            </span>
            <span className={styles.plateMeta}>{plateAnnotation}</span>
          </div>

          <div className={styles.plateBody}>
            <p className={styles.plateFocusLabel}>{plateFocusLabel}</p>
            <ul className={styles.plateFocus}>
              {plateFocus.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>

          <p className={styles.plateLocation}>{site.person.locationLabel}</p>

          <span className={styles.plateIndex} aria-hidden="true" />
        </aside>
      </div>
    </section>
  )
}
