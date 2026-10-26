import type { ReactNode } from 'react'
import styles from './ExternalLink.module.css'

interface ExternalLinkProps {
  href: string
  children: ReactNode
  /** Dica de nova aba, lida só por tecnologia assistiva. */
  hint: string
}

/** Link para fora do site: abre em nova aba e diz isso no nome acessível. */
export function ExternalLink({ href, children, hint }: ExternalLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.link}
    >
      {children}
      {/* O espaço fica dentro do span: fora dele, seria sublinhado. */}
      <span className="visually-hidden"> {hint}</span>
    </a>
  )
}
