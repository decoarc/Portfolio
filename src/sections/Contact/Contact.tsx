import type { SiteContent } from '../../content/types.ts'
import { ExternalLink } from '../../components/ExternalLink/ExternalLink.tsx'
import { SectionHead } from '../../components/SectionHead/SectionHead.tsx'
import { Sheet } from '../../components/Sheet/Sheet.tsx'
import styles from './Contact.module.css'

interface ContactProps {
  /** Posição da seção na home: o mesmo número do índice. */
  index: number
  copy: SiteContent['contact']
  /** Dica de nova aba dos canais (`links.externalHint`). */
  externalHint: string
}

const HEADING_ID = 'contact-heading'

/** Contato: a contracapa, de volta ao papel da capa. */
export function Contact({ index, copy, externalHint }: ContactProps) {
  return (
    <Sheet
      tone="cover"
      id="contact"
      labelledBy={HEADING_ID}
      className={styles.contact}
    >
      <SectionHead index={index} headingId={HEADING_ID} title={copy.label} />
      <p className={styles.lead}>{copy.lead}</p>
      <ul className={styles.channels}>
        {copy.channels.map((channel) => (
          <li key={channel.id}>
            <ExternalLink href={channel.href} hint={externalHint}>
              {channel.label}
            </ExternalLink>
          </li>
        ))}
      </ul>
    </Sheet>
  )
}
