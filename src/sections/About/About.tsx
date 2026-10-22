import type { SiteContent } from '@/content/types'
import { MotionReveal } from '@/motion'
import styles from './About.module.css'

interface AboutProps {
  site: SiteContent
}

/**
 * About — editorial narrative + Datum capability lists.
 * MP-3: coordinated section reveal.
 */
export function About({ site }: AboutProps) {
  const { about } = site

  return (
    <section
      id="about"
      className={styles.about}
      aria-labelledby="about-heading"
    >
      <div className={styles.inner}>
        <MotionReveal>
          <header className={styles.header}>
            <p className={styles.index} aria-hidden="true">
              03
            </p>
            <h2 id="about-heading" className={styles.title}>
              {about.title}
            </h2>
          </header>
        </MotionReveal>

        <div className={styles.layout}>
          <MotionReveal delayMs={60}>
            <div className={styles.prose}>
              <p className={styles.lead}>{about.lead}</p>
              <p className={styles.body}>{about.body}</p>
            </div>
          </MotionReveal>

          <MotionReveal delayMs={120}>
            <div className={styles.lists}>
              <div className={styles.listBlock}>
                <h3 className={styles.listLabel}>{about.stackLabel}</h3>
                <ul className={styles.list}>
                  {about.stack.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div className={styles.listBlock}>
                <h3 className={styles.listLabel}>{about.exploringLabel}</h3>
                <ul className={styles.list}>
                  {about.exploring.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </MotionReveal>
        </div>
      </div>
    </section>
  )
}
