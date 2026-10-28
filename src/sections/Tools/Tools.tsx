import type { SiteContent } from '../../content/types.ts'
import { SectionHead } from '../../components/SectionHead/SectionHead.tsx'
import { Sheet } from '../../components/Sheet/Sheet.tsx'
import styles from './Tools.module.css'

interface ToolsProps {
  /** Posição da seção na home: o mesmo número do índice. */
  index: number
  copy: SiteContent['tools']
}

const HEADING_ID = 'tools-heading'

/**
 * Ferramentas: um grupo por linha entre filetes, o nome em rótulo mono e as
 * ferramentas em etiquetas de borda fina. Sem nível de proficiência.
 */
export function Tools({ index, copy }: ToolsProps) {
  return (
    <Sheet
      tone="sheet"
      id="tools"
      labelledBy={HEADING_ID}
      className={styles.tools}
    >
      <SectionHead index={index} headingId={HEADING_ID} title={copy.label} />
      <div className={styles.groups}>
        {copy.groups.map((group, position) => {
          const labelId = `tools-group-${position + 1}`
          return (
            <div key={group.name} className={styles.group}>
              <p id={labelId} className={styles.name}>
                {group.name}
              </p>
              <ul aria-labelledby={labelId} className={styles.tags}>
                {group.items.map((item) => (
                  <li key={item} className={styles.tag}>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )
        })}
      </div>
    </Sheet>
  )
}
