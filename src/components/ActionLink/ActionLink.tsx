import { useEffect, useRef, type ReactNode, type RefObject } from 'react'
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
  /**
   * A prévia aceita o cursor: passar do link para ela não a fecha (WCAG
   * 1.4.13). Só o cartão do contato; a tira é decorativa e redundante.
   */
  peekHoverable?: boolean
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
  peekHoverable,
  className,
}: ActionLinkProps) {
  const ref = useRef<HTMLAnchorElement>(null)
  const wrapperRef = useRef<HTMLSpanElement>(null)
  useMagnet(ref)
  usePeekDismiss(wrapperRef, ref, Boolean(peek))

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
    <span ref={wrapperRef} className={styles.wrapper}>
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
          className={[
            styles.peekSlot,
            peekHoverable && styles.hoverable,
            peekClassName,
          ]
            .filter(Boolean)
            .join(' ')}
          data-motion="peek"
          aria-hidden="true"
        >
          {peek}
        </span>
      )}
    </span>
  )
}

/**
 * Escape dispensa a prévia aberta por hover ou foco (WCAG 1.4.13): marca
 * `data-peek="dismissed"` no wrapper até o cursor sair dele e o foco sair do
 * link. Só atributo no DOM: nenhum estado React, nenhum rAF.
 */
function usePeekDismiss(
  wrapperRef: RefObject<HTMLSpanElement | null>,
  linkRef: RefObject<HTMLAnchorElement | null>,
  enabled: boolean,
) {
  useEffect(() => {
    const wrapper = wrapperRef.current
    const link = linkRef.current
    if (!enabled || !wrapper || !link) return
    let hovered = false
    // Com cursor e foco juntos, a prévia só volta quando os dois saem.
    const onEnter = () => {
      hovered = true
    }
    const onLeave = () => {
      hovered = false
      if (document.activeElement !== link) wrapper.removeAttribute('data-peek')
    }
    const onBlur = () => {
      if (!hovered) wrapper.removeAttribute('data-peek')
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      if (hovered || document.activeElement === link) {
        wrapper.setAttribute('data-peek', 'dismissed')
      }
    }
    wrapper.addEventListener('pointerenter', onEnter)
    wrapper.addEventListener('pointerleave', onLeave)
    link.addEventListener('blur', onBlur)
    document.addEventListener('keydown', onKey)
    return () => {
      wrapper.removeEventListener('pointerenter', onEnter)
      wrapper.removeEventListener('pointerleave', onLeave)
      link.removeEventListener('blur', onBlur)
      document.removeEventListener('keydown', onKey)
    }
  }, [wrapperRef, linkRef, enabled])
}
