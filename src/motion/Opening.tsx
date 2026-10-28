import { useLayoutEffect, useRef, type ReactNode } from 'react'
import { openingFrame, openingProgress } from './opening.ts'
import { prefersReducedMotion } from './reducedMotion.ts'
import { onScroll } from './smoothScroll.ts'

/** Arredonda para 3 casas. */
const round = (value: number) => String(Math.round(value * 1000) / 1000)

/** Folga além da entrada (1,1 s + 120 ms) antes de dá-la por terminada. */
const ENTRANCE_TIMEOUT_MS = 1800

/**
 * Assume a marca do script inline do `<head>` (`src/app/entranceEarly.ts`) e
 * a tira do `<html>`. Devolve o valor que ela tinha.
 */
function takeEarlyMark(): string | undefined {
  const html = document.documentElement
  const mark = html.dataset.entranceEarly
  delete html.dataset.entranceEarly
  return mark
}

/**
 * A abertura da home: envolve o hero e o índice, que rolam no fluxo. Escreve
 * `--opening-drift` (o afastamento do nome, que o Hero lê no CSS) e conduz a
 * entrada do nome por `data-entrance`. Com reduced motion não faz nada: o
 * nome fica no lugar.
 */
export function Opening({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  // Lida uma vez por montagem: o efeito duplo do StrictMode não perde o
  // `expired` que a primeira passada já tirou do `<html>`.
  const earlyMark = useRef<string | undefined | null>(null)

  useLayoutEffect(() => {
    // Sempre, inclusive com reduced motion: a marca não pode ficar no `<html>`.
    if (earlyMark.current === null) earlyMark.current = takeEarlyMark()
    const root = ref.current
    if (!root || prefersReducedMotion()) return
    root.setAttribute('data-opening', '')

    // Último progresso escrito: com o hero fora da janela (1) ou de volta ao
    // início (0) o scroll segue disparando, mas não há nada novo a escrever.
    let written = -1
    const write = () => {
      const progress = openingProgress(window.scrollY, window.innerHeight)
      if (progress === written) return
      written = progress
      const frame = openingFrame(progress, window.innerWidth)
      root.style.setProperty('--opening-drift', round(frame.driftVw))
    }
    const onResize = () => {
      // A largura muda os valores (celular × desktop) mesmo no mesmo progresso.
      written = -1
      write()
    }
    onResize()
    const stopScroll = onScroll(write)
    window.addEventListener('resize', onResize)

    // Entrada só para quem chega no topo; antes da primeira pintura, para o
    // nome não piscar no lugar. No HTML pré-renderizado quem o esconde antes
    // do JS é o script inline (`pending`); se o JS demorou mais de 3 s ele já
    // reapareceu (`expired`) e não some de novo para entrar. Com hash a
    // página ainda está em 0 aqui (o ScrollManager rola depois), mas vai
    // abrir rolada. Começa depois das
    // fontes, para não revelar a fonte de fallback, e com dois frames para o
    // estado escondido ser pintado. Se nesse meio-tempo o navegador restaurou
    // a posição (voltar), não há entrada: o nome aparece no lugar.
    let cancelled = false
    let timeout = 0
    const finish = () => {
      if (root.dataset.entrance === 'run') root.dataset.entrance = 'done'
    }
    if (
      earlyMark.current !== 'expired' &&
      window.scrollY === 0 &&
      !window.location.hash
    ) {
      root.dataset.entrance = 'pending'
      const fontsReady = document.fonts?.ready ?? Promise.resolve()
      void fontsReady.then(() => {
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

    return () => {
      cancelled = true
      window.clearTimeout(timeout)
      stopScroll()
      window.removeEventListener('resize', onResize)
      root.removeEventListener('transitionend', onTransitionEnd)
      root.removeAttribute('data-entrance')
      root.removeAttribute('data-opening')
      root.removeAttribute('style')
    }
  }, [])

  return <div ref={ref}>{children}</div>
}
