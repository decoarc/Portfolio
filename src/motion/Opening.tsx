import { useLayoutEffect, useRef, type ReactNode } from 'react'
import styles from './Opening.module.css'
import { openingFrame, openingProgress } from './opening.ts'
import { prefersReducedMotion } from './reducedMotion.ts'
import { onScroll, scrollToTop } from './smoothScroll.ts'

/** Arredonda para 3 casas: `sin(π)` não é zero exato. */
const round = (value: number) => String(Math.round(value * 1000) / 1000)

/** Folga além da entrada (1,1 s + 120 ms) antes de dá-la por terminada. */
const ENTRANCE_TIMEOUT_MS = 1800

/**
 * A abertura da home: envolve o hero (primeiro filho, preso no topo) e a
 * folha do índice que sobe por cima. Escreve as `--opening-*` que Hero e
 * Release leem no CSS e conduz a entrada do nome por `data-entrance`. Com
 * reduced motion não faz nada: as seções ficam no estado estático.
 */
export function Opening({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const root = ref.current
    if (!root || prefersReducedMotion()) return
    const hero = root.firstElementChild as HTMLElement | null
    const sheet = hero?.nextElementSibling ?? null
    // Liga o hero preso (CSS). Sem isto — sem JS, reduced motion — o hero fica
    // no fluxo normal, como no Gate 2.
    root.setAttribute('data-opening', '')

    // Hero mais alto que a janela (celular deitado, zoom): prende com `top`
    // negativo, para ele rolar até o fim antes de parar.
    const measure = () => {
      const overflow = hero ? window.innerHeight - hero.offsetHeight : 0
      root.style.setProperty(
        '--opening-sticky-top',
        `${Math.min(0, overflow)}px`,
      )
    }

    const write = () => {
      const frame = openingFrame(
        openingProgress(window.scrollY, window.innerHeight),
        window.innerWidth,
      )
      root.style.setProperty('--opening-drift', round(frame.driftVw))
      root.style.setProperty(
        '--opening-bottom-shift',
        round(frame.bottomShiftVh),
      )
      root.style.setProperty(
        '--opening-bottom-opacity',
        round(frame.bottomOpacity),
      )
      root.style.setProperty('--opening-hero-scale', round(frame.heroScale))
      root.style.setProperty('--opening-shade', round(frame.shadeOpacity))
      root.style.setProperty('--opening-curve', round(frame.curveVh))
      root.toggleAttribute('data-shade', frame.shadeOpacity > 0)
    }
    const onResize = () => {
      measure()
      write()
    }
    onResize()
    const stopScroll = onScroll(write)
    window.addEventListener('resize', onResize)

    // Entrada só para quem chega no topo; antes da primeira pintura, para o
    // nome não piscar no lugar. Com hash a página ainda está em 0 aqui (o
    // ScrollManager rola depois), mas vai abrir rolada. Começa depois das
    // fontes, para não revelar a fonte de fallback, e com dois frames para o
    // estado escondido ser pintado. Se nesse meio-tempo o navegador restaurou
    // a posição (voltar), não há entrada: o nome aparece no lugar.
    let cancelled = false
    let timeout = 0
    const finish = () => {
      if (root.dataset.entrance === 'run') root.dataset.entrance = 'done'
    }
    if (window.scrollY === 0 && !window.location.hash) {
      root.dataset.entrance = 'pending'
      const fontsReady = document.fonts?.ready ?? Promise.resolve()
      void fontsReady.then(() => {
        if (!cancelled) measure()
        requestAnimationFrame(() =>
          requestAnimationFrame(() => {
            if (cancelled) return
            if (window.scrollY > 0) {
              root.removeAttribute('data-entrance')
              return
            }
            root.dataset.entrance = 'run'
            timeout = window.setTimeout(finish, ENTRANCE_TIMEOUT_MS)
          }),
        )
      })
    }
    const onTransitionEnd = (event: TransitionEvent) => {
      const words = root.querySelectorAll('[data-motion="entrance"]')
      if (event.target === words[words.length - 1]) finish()
    }
    root.addEventListener('transitionend', onTransitionEnd)

    // Foco por teclado num elemento do hero coberto pela folha ou fora da
    // janela: volta ao topo e traz o elemento à vista. Só teclado: um clique
    // também foca o link, e mover a página entre mousedown e mouseup
    // engoliria o clique.
    const onFocusIn = (event: FocusEvent) => {
      const target = event.target
      if (!(target instanceof HTMLElement) || !target.matches(':focus-visible'))
        return
      const box = target.getBoundingClientRect()
      const visibleBottom = Math.min(
        window.innerHeight,
        sheet?.getBoundingClientRect().top ?? Infinity,
      )
      if (box.top >= 0 && box.bottom <= visibleBottom) return
      scrollToTop()
      write()
      target.scrollIntoView({ block: 'nearest' })
    }
    hero?.addEventListener('focusin', onFocusIn)

    return () => {
      cancelled = true
      window.clearTimeout(timeout)
      stopScroll()
      window.removeEventListener('resize', onResize)
      root.removeEventListener('transitionend', onTransitionEnd)
      hero?.removeEventListener('focusin', onFocusIn)
      root.removeAttribute('data-entrance')
      root.removeAttribute('data-shade')
      root.removeAttribute('data-opening')
      root.removeAttribute('style')
    }
  }, [])

  return (
    <div ref={ref} className={styles.opening}>
      {children}
    </div>
  )
}
