import type { SiteContent } from '../../content/types.ts'
import { SectionHead } from '../../components/SectionHead/SectionHead.tsx'
import { Sheet } from '../../components/Sheet/Sheet.tsx'
import styles from './Interests.module.css'

interface InterestsProps {
  /** Posição da seção na home: o mesmo número do índice. */
  index: number
  copy: SiteContent['interests']
}

const HEADING_ID = 'interests-heading'

/** Interesses: uma linha mono, itens separados por ponto médio. */
export function Interests({ index, copy }: InterestsProps) {
  return (
    <Sheet
      tone="sheet"
      id="interests"
      labelledBy={HEADING_ID}
      className={styles.interests}
    >
      <SectionHead index={index} headingId={HEADING_ID} title={copy.label} />
      <ul className={styles.list}>
        {copy.items.map((item) => (
          <li key={item} className={styles.item}>
            {item}
          </li>
        ))}
      </ul>
    </Sheet>
  )
}
