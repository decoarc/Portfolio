import {
  Fragment,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from 'react'
import { prefersReducedMotion } from '../../motion/reducedMotion.ts'
import { litProgress } from '../../motion/scrollLit.ts'
import { onScroll } from '../../motion/smoothScroll.ts'
import styles from './LitText.module.css'

interface LitTextProps {
  text: string
  className?: string
}

/**
 * Parágrafo que acende palavra por palavra conforme a rolagem. O primeiro
 * render é o texto simples, aceso. Depois de montar (sem reduced motion), as
 * palavras viram `span`s escondidos do leitor de tela, que lê a cópia inteira
 * em `.visually-hidden`; o progresso vai em `--lit` a cada evento de scroll,
 * sem estado React por frame.
 */
export function LitText({ text, className }: LitTextProps) {
  const ref = useRef<HTMLParagraphElement>(null)
  const [split, setSplit] = useState(false)
  const words = text.trim().split(/\s+/)

  useLayoutEffect(() => {
    if (!prefersReducedMotion()) setSplit(true)
  }, [])

  useLayoutEffect(() => {
    const p = ref.current
    if (!split || !p) return
    p.setAttribute('data-lit', '')
    const count = text.trim().split(/\s+/).length

    let written = ''
    const write = () => {
      const box = p.getBoundingClientRect()
      const remaining =
        document.documentElement.scrollHeight -
        window.innerHeight -
        window.scrollY
      const lit = litProgress(box, window.innerHeight, remaining, count)
      const value = String(Math.round(lit * 1000) / 1000)
      if (value === written) return
      written = value
      p.style.setProperty('--lit', value)
    }
    write()
    const stopScroll = onScroll(write)
    window.addEventListener('resize', write)
    // A altura muda quando a fonte chega.
    let cancelled = false
    void document.fonts?.ready.then(() => {
      if (!cancelled) write()
    })

    return () => {
      cancelled = true
      stopScroll()
      window.removeEventListener('resize', write)
      p.removeAttribute('data-lit')
      p.style.removeProperty('--lit')
    }
  }, [split, text])

  if (!split) {
    return (
      <p ref={ref} className={className}>
        {text}
      </p>
    )
  }

  return (
    <p ref={ref} className={className}>
      <span className={`visually-hidden ${styles.copy}`}>{text}</span>
      <span aria-hidden="true">
        {words.map((word, i) => (
          <Fragment key={`${i}-${word}`}>
            {i > 0 && ' '}
            <span className={styles.word} style={{ '--i': i } as CSSProperties}>
              {word}
            </span>
          </Fragment>
        ))}
      </span>
    </p>
  )
}
