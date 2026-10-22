import type { SiteContent } from '@/content/types'
import { MotionReveal } from '@/motion'
import styles from './Contact.module.css'

interface ContactProps {
  site: SiteContent
}

/**
 * Contact / closing — Cut field.
 * MP-3: reveal + optional rule emphasis (no case-study route theatre).
 */
export function Contact({ site }: ContactProps) {
  const { contact, social, person } = site
  const channels = social.filter((item) => item.professionalDefault !== false)

  return (
    <section
      id="contact"
      className={styles.contact}
      aria-labelledby="contact-heading"
      data-theme="field"
    >
      <div className={styles.inner}>
        <MotionReveal>
          <p className={styles.index} aria-hidden="true">
            04
          </p>
          <h2 id="contact-heading" className={styles.title}>
            {contact.title}
          </h2>
          <span className={styles.cutRule} aria-hidden="true" />
        </MotionReveal>

        <MotionReveal delayMs={70}>
          <p className={styles.lead}>{contact.lead}</p>
          {contact.note ? <p className={styles.note}>{contact.note}</p> : null}
        </MotionReveal>

        <MotionReveal delayMs={120} className={styles.channelsReveal}>
          <ul className={styles.channels}>
            {channels.map((item) => (
              <li key={item.id}>
                <a
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.channel}
                >
                  <span className={styles.channelLabel}>{item.label}</span>
                  <span className={styles.channelHint}>External</span>
                </a>
              </li>
            ))}
          </ul>
        </MotionReveal>

        <MotionReveal delayMs={160}>
          <p className={styles.signoff}>
            <span className={styles.signoffName}>{person.name}</span>
            <span className={styles.signoffMeta}>{person.locationLabel}</span>
          </p>
        </MotionReveal>
      </div>
    </section>
  )
}
