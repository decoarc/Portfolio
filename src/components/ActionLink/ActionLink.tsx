import { useRef, type ReactNode } from 'react'
import { useMagnet } from '../../motion/magnet.ts'
import styles from './ActionLink.module.css'

interface ActionLinkProps {
  href: string
  children: ReactNode
  /** 'strong': traço de 2px em --accent (CTA primário). 'quiet': 1px em --rule. */
  tone: 'strong' | 'quiet'
  /** Link para fora: nova aba, dica no nome acessível e seta ↗. */
  external?: { hint: string }
  /** Prévia decorativa, renderizada como irmã do <a> dentro do wrapper. */
  peek?: ReactNode
  /** Posiciona o slot da prévia (top/bottom/left/right por faixa). */
  peekClassName?: string
  /** Aplicada ao <a> (tamanho e cor do texto vêm do chamador). */
  className?: string
}

/**
 * Link de ação do hero e do contato: o traço sob o texto corre no hover e no
 * foco, o link é puxado pelo mouse e, se houver, mostra uma prévia
 * decorativa. Traço e prévia ficam fora do nome acessível.
 */
export function ActionLink({
  href,
  children,
  tone,
  external,
  peek,
  peekClassName,
  className,
}: ActionLinkProps) {
  const ref = useRef<HTMLAnchorElement>(null)
  useMagnet(ref)

  const trace = (
    <span className={styles.trace} data-motion="trace" aria-hidden="true" />
  )
  const linkClass = [
    styles.link,
    styles[tone],
    external && styles.external,
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <span className={styles.wrapper}>
      <a
        ref={ref}
        href={href}
        className={linkClass}
        data-motion="action-link"
        {...(external && { target: '_blank', rel: 'noopener noreferrer' })}
      >
        {external ? (
          // O traço mede só texto + dica: a seta ↗ fica de fora.
          <span className={styles.label}>
            {children}
            {/* O espaço fica dentro do span: fora dele, entraria no traço. */}
            <span className="visually-hidden"> {external.hint}</span>
            {trace}
          </span>
        ) : (
          <>
            {children}
            {trace}
          </>
        )}
      </a>
      {peek && (
        <span
          className={[styles.peekSlot, peekClassName].filter(Boolean).join(' ')}
          data-motion="peek"
          aria-hidden="true"
        >
          {peek}
        </span>
      )}
    </span>
  )
}
