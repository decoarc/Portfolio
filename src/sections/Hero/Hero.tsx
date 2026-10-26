import type { SiteContent } from '../../content/types.ts'
import { Sheet } from '../../components/Sheet/Sheet.tsx'
import styles from './Hero.module.css'

interface HeroProps {
  person: SiteContent['person']
  copy: SiteContent['hero']
}

/** Frontispício: só tipografia, portado do comp 02. */
export function Hero({ person, copy }: HeroProps) {
  return (
    <Sheet tone="cover" labelledBy="hero-name" className={styles.hero}>
      <p className={`${styles.meta} ${styles.metaLeft}`}>{copy.metaLeft}</p>
      <p className={`${styles.meta} ${styles.metaRight}`}>{copy.metaRight}</p>
      <h1 id="hero-name" className={styles.name}>
        {person.name}
      </h1>
      <p className={styles.role}>{person.role}</p>
      <p className={styles.statement}>{copy.statement}</p>
      <div className={styles.actions}>
        <a className={`${styles.action} ${styles.primary}`} href="#work">
          {copy.ctaPrimary}
        </a>
        <a className={`${styles.action} ${styles.ghost}`} href="#contact">
          {copy.ctaSecondary}
        </a>
      </div>
      <p className={styles.location}>{person.location}</p>
    </Sheet>
  )
}
