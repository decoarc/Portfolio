import { useLayoutEffect, useRef, type ReactNode } from 'react'
import { prefersReducedMotion } from './reducedMotion.ts'
import { revealFrame, revealProgress } from './reveal.ts'
import { onScroll, scrollToTarget } from './smoothScroll.ts'

/** Arredonda para 3 casas: `sin(π)` não é zero exato. */
const round = (value: number) => String(Math.round(value * 1000) / 1000)

/**
 * O fim da home: envolve o Sobre (primeiro filho) e o Contato (segundo), que
 * fica preso no pé da janela enquanto o Sobre sobe por cima e o revela. Marca
 * `data-reveal` (que liga o Contato preso no CSS) e escreve as `--reveal-*`
 * que Sobre e Contato leem. Com reduced motion não faz nada; o Contato também
 * não fica preso se não couber na janela, para nada dele ficar escondido.
 */
export function Reveal({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const root = ref.current
    if (!root || prefersReducedMotion()) return
    const upper = root.firstElementChild as HTMLElement | null
    const lower = upper?.nextElementSibling as HTMLElement | null
    if (!upper || !lower) return

    let fits = false
    let active = false
    let progress = 1
    // Último frame escrito: antes e depois da revelação o scroll segue
    // disparando, mas não há nada novo a escrever.
    let written = ''
    const write = () => {
      const upperBottom = upper.getBoundingClientRect().bottom
      // Preso só a partir de uma tela antes da revelação, ainda escondido
      // atrás do Sobre: longe dali o Contato fica no fluxo, e nada da página
      // fica coberto (o axe mede o contraste dele no topo da home).
      active = fits && upperBottom <= 2 * window.innerHeight
      progress = active
        ? revealProgress(upperBottom, window.innerHeight, lower.offsetHeight)
        : 1
      const frame = revealFrame(progress, window.innerWidth)
      const curve = round(frame.curveVh)
      const shade = round(frame.shadeOpacity)
      const next = `${active} ${curve} ${shade}`
      if (next === written) return
      written = next
      root.toggleAttribute('data-reveal', active)
      root.style.setProperty('--reveal-curve', curve)
      root.style.setProperty('--reveal-shade', shade)
      root.toggleAttribute('data-reveal-shade', frame.shadeOpacity > 0)
    }
    const layout = () => {
      fits = lower.offsetHeight <= window.innerHeight
      written = ''
      write()
    }
    layout()
    const stopScroll = onScroll(write)
    window.addEventListener('resize', layout)
    // A altura do Contato muda quando a fonte chega.
    let cancelled = false
    void document.fonts?.ready.then(() => {
      if (!cancelled) layout()
    })

    // Foco por teclado no Contato ainda coberto pelo Sobre: rola até ele
    // inteiro. Só teclado: um clique também foca o link, e mover a página
    // entre mousedown e mouseup engoliria o clique.
    const onFocusIn = (event: FocusEvent) => {
      const target = event.target
      if (!(target instanceof HTMLElement) || !target.matches(':focus-visible'))
        return
      if (!active || progress >= 1) return
      scrollToTarget(lower, { immediate: true })
      write()
    }
    lower.addEventListener('focusin', onFocusIn)

    return () => {
      cancelled = true
      stopScroll()
      window.removeEventListener('resize', layout)
      lower.removeEventListener('focusin', onFocusIn)
      root.removeAttribute('data-reveal')
      root.removeAttribute('data-reveal-shade')
      root.removeAttribute('style')
    }
  }, [])

  return <div ref={ref}>{children}</div>
}
