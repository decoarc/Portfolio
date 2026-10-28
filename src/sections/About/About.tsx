import type { SiteContent } from '../../content/types.ts'
import { SectionHead } from '../../components/SectionHead/SectionHead.tsx'
import { LitText } from '../../components/LitText/index.ts'
import { Sheet } from '../../components/Sheet/Sheet.tsx'
import styles from './About.module.css'

interface AboutProps {
  /** Posição da seção na home: o mesmo número do índice. */
  index: number
  copy: SiteContent['about']
}

const HEADING_ID = 'about-heading'

/** Sobre: medida curta, lead (que acende com o scroll) e corpo. As ferramentas ficam na seção Ferramentas. */
export function About({ index, copy }: AboutProps) {
  return (
    <Sheet
      tone="sheet"
      id="about"
      labelledBy={HEADING_ID}
      className={styles.about}
    >
      <SectionHead index={index} headingId={HEADING_ID} title={copy.label} />
      <div className={styles.text}>
        <LitText className={styles.lead} text={copy.lead} />
        <p className={styles.body}>{copy.body}</p>
      </div>
    </Sheet>
  )
}
