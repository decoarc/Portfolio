import { Fragment } from 'react'
import type { SiteContent } from '../../content/types.ts'
import { ActionLink } from '../../components/ActionLink/ActionLink.tsx'
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

/**
 * O endereço do cartão não tem espaço: em 280px ele quebra depois de uma
 * barra, nunca no meio do nome.
 */
function breakAfterSlashes(address: string) {
  return address.split('/').map((part, index, parts) => (
    <Fragment key={index}>
      {part}
      {index < parts.length - 1 && (
        <>
          /<wbr />
        </>
      )}
    </Fragment>
  ))
}

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
            <ActionLink
              href={channel.href}
              tone="quiet"
              external={{ hint: externalHint }}
              className={styles.channel}
              peekClassName={styles.card}
              peekHoverable
              peek={
                <>
                  <span className={styles.mark}>{channel.peek.mark}</span>
                  <span className={styles.address}>
                    {breakAfterSlashes(
                      channel.href.replace(/^https?:\/\//, ''),
                    )}
                  </span>
                  <span className={styles.note}>{channel.peek.note}</span>
                </>
              }
            >
              {channel.label}
            </ActionLink>
          </li>
        ))}
      </ul>
    </Sheet>
  )
}
