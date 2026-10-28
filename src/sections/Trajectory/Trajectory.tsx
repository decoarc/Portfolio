import type { SiteContent } from '../../content/types.ts'
import { SectionHead } from '../../components/SectionHead/SectionHead.tsx'
import { Sheet } from '../../components/Sheet/Sheet.tsx'
import styles from './Trajectory.module.css'

interface TrajectoryProps {
  /** Posição da seção na home: o mesmo número do índice. */
  index: number
  copy: SiteContent['trajectory']
}

const HEADING_ID = 'trajectory-heading'
const EXPERIENCE_ID = 'trajectory-experience'
const EDUCATION_ID = 'trajectory-education'

/**
 * Trajetória: a experiência numa linha do tempo (fio e marcadores
 * decorativos, o cargo atual destacado) e a formação em linhas entre filetes,
 * como a lista de trabalhos. Sem motion.
 */
export function Trajectory({ index, copy }: TrajectoryProps) {
  return (
    <Sheet tone="sheet" id="trajectory" labelledBy={HEADING_ID}>
      <SectionHead
        index={index}
        headingId={HEADING_ID}
        title={copy.label}
        intro={copy.intro}
      />

      <p id={EXPERIENCE_ID} className={styles.label}>
        {copy.experienceLabel}
      </p>
      <ol aria-labelledby={EXPERIENCE_ID} className={styles.timeline}>
        {copy.experience.map((item) => (
          <li
            key={`${item.start}-${item.role}`}
            className={styles.job}
            data-current={item.current ? '' : undefined}
          >
            <p className={styles.when}>
              <time dateTime={item.start}>{item.period}</time> · {item.mode}
            </p>
            <h3 className={styles.role}>{item.role}</h3>
            <p className={styles.org}>
              {item.company} · {item.contract}
            </p>
            <p className={styles.summary}>{item.summary}</p>
            <ul className={styles.tech}>
              {item.tech.map((name) => (
                <li key={name}>{name}</li>
              ))}
            </ul>
          </li>
        ))}
      </ol>

      <p id={EDUCATION_ID} className={`${styles.label} ${styles.eduLabel}`}>
        {copy.educationLabel}
      </p>
      <ul aria-labelledby={EDUCATION_ID} className={styles.education}>
        {copy.education.map((entry) => (
          <li key={entry.course} className={styles.course}>
            <span className={styles.period}>{entry.period}</span>
            <span>
              <span className={styles.courseName}>{entry.course}</span>
              <span className={styles.institution}> · {entry.institution}</span>
            </span>
          </li>
        ))}
      </ul>
    </Sheet>
  )
}
