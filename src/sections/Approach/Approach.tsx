import type { SiteContent } from '../../content/types.ts'
import { SectionHead } from '../../components/SectionHead/SectionHead.tsx'
import { Sheet } from '../../components/Sheet/Sheet.tsx'
import styles from './Approach.module.css'

interface ApproachProps {
  /** Posição da seção na home: o mesmo número do índice. */
  index: number
  copy: SiteContent['approach']
}

const HEADING_ID = 'approach-heading'

/**
 * Abordagem: fichas no padrão das lâminas de Work, sem número — no trilho,
 * numeral é só de seção (o mesmo do índice).
 */
export function Approach({ index, copy }: ApproachProps) {
  return (
    <Sheet
      tone="sheet"
      id="approach"
      labelledBy={HEADING_ID}
      className={styles.approach}
    >
      <SectionHead
        index={index}
        headingId={HEADING_ID}
        title={copy.label}
        intro={copy.intro}
        litIntro
      />
      <ol className={styles.list}>
        {copy.items.map((item) => (
          <li key={item.title} className={styles.item}>
            <h3 className={styles.title}>{item.title}</h3>
            <p className={styles.body}>{item.body}</p>
          </li>
        ))}
      </ol>
    </Sheet>
  )
}
