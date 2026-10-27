import { Fragment, type ReactNode } from 'react'
import type { SiteContent } from '../../content/types.ts'
import { ActionLink } from '../../components/ActionLink/ActionLink.tsx'
import { Sheet } from '../../components/Sheet/Sheet.tsx'
import styles from './Hero.module.css'

interface HeroProps {
  person: SiteContent['person']
  copy: SiteContent['hero']
  /** Prévia decorativa do CTA primário (a tira de capas). */
  ctaPeek?: ReactNode
}

/** Frontispício: só tipografia, portado do comp 02. */
export function Hero({ person, copy, ctaPeek }: HeroProps) {
  // Cada linha corta o que passa da sua altura (a fenda da entrada) e se
  // afasta para um lado no scroll; o espaço entre elas mantém o nome acessível.
  const [first, ...rest] = person.name.split(' ')
  const lines = [
    { text: first, drift: '-1' },
    { text: rest.join(' '), drift: '1' },
  ].filter((line) => line.text)

  return (
    <Sheet tone="cover" labelledBy="hero-name" className={styles.hero}>
      <p className={`${styles.meta} ${styles.metaLeft}`}>{copy.metaLeft}</p>
      <p className={`${styles.meta} ${styles.metaRight}`}>{copy.metaRight}</p>
      <h1 id="hero-name" className={styles.name}>
        {lines.map((line, index) => (
          <Fragment key={line.drift}>
            {index > 0 && ' '}
            <span className={styles.line}>
              <span className={styles.drift} data-drift={line.drift}>
                <span className={styles.word} data-motion="entrance">
                  {line.text}
                </span>
              </span>
            </span>
          </Fragment>
        ))}
      </h1>
      <p className={styles.role}>{person.role}</p>
      <p className={styles.statement}>{copy.statement}</p>
      <div className={styles.actions}>
        <ActionLink
          href="#work"
          tone="strong"
          className={styles.action}
          peek={ctaPeek}
          peekClassName={styles.strip}
        >
          {copy.ctaPrimary}
        </ActionLink>
        <ActionLink
          href="#contact"
          tone="quiet"
          className={`${styles.action} ${styles.ghost}`}
        >
          {copy.ctaSecondary}
        </ActionLink>
      </div>
      <p className={styles.location}>{person.location}</p>
    </Sheet>
  )
}
