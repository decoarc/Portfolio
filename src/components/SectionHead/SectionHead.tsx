import styles from './SectionHead.module.css'

interface SectionHeadProps {
  /** Posição da seção na home (1, 2, …): o mesmo número do índice. */
  index: number
  headingId: string
  title: string
  intro?: string
}

/** Cabeçalho de seção numerada: o número sai para o trilho de margem. */
export function SectionHead({
  index,
  headingId,
  title,
  intro,
}: SectionHeadProps) {
  return (
    <div className={styles.head}>
      <div className={styles.line}>
        <span className={styles.index}>{String(index).padStart(2, '0')}</span>
        <h2 id={headingId} className={styles.title}>
          {title}
        </h2>
      </div>
      {intro && <p className={styles.intro}>{intro}</p>}
    </div>
  )
}
