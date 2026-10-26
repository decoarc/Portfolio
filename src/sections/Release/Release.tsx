import type { HomeSectionId, SiteContent } from '../../content/types.ts'
import { Sheet } from '../../components/Sheet/Sheet.tsx'
import styles from './Release.module.css'

interface ReleaseProps {
  copy: SiteContent['release']
  /** Só as seções que a home renderiza; a posição define o número. */
  sections: HomeSectionId[]
}

/** A virada de página: o índice numerado da home, na folha mais clara. */
export function Release({ copy, sections }: ReleaseProps) {
  return (
    <Sheet tone="sheet" className={styles.release}>
      <nav aria-label={copy.label}>
        <ol className={styles.list}>
          {sections.map((id, index) => (
            <li key={id} className={styles.entry}>
              <a href={`#${id}`} className={styles.link}>
                <span className={styles.index}>
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className={styles.label}>{copy.entries[id]}</span>
              </a>
            </li>
          ))}
        </ol>
      </nav>
    </Sheet>
  )
}
