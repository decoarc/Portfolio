import Lenis from 'lenis'
import { prefersReducedMotion } from './reducedMotion.ts'

/**
 * Scroll suave do site (Lenis), uma instância só. Desligado com reduced
 * motion: aí tudo cai no scroll nativo. Toque continua nativo (padrão do Lenis).
 * Sem `anchors`: a rolagem até âncoras é do `ScrollManager`.
 */
let lenis: Lenis | null = null

export function startSmoothScroll(): boolean {
  if (lenis) return true
  if (prefersReducedMotion()) return false
  lenis = new Lenis({ lerp: 0.09, autoRaf: true })
  return true
}

export function stopSmoothScroll(): void {
  lenis?.destroy()
  lenis = null
}

export function isSmoothScrollActive(): boolean {
  return lenis !== null
}

/** Assina o scroll: o evento do Lenis quando ativo, senão o da janela, um por frame. */
export function onScroll(listener: () => void): () => void {
  if (lenis) return lenis.on('scroll', listener)

  let frame = 0
  const schedule = () => {
    if (frame) return
    frame = requestAnimationFrame(() => {
      frame = 0
      listener()
    })
  }
  window.addEventListener('scroll', schedule, { passive: true })
  return () => {
    window.removeEventListener('scroll', schedule)
    cancelAnimationFrame(frame)
  }
}

/**
 * Remede a página. O Lenis faz isso sozinho com 250 ms de atraso; logo depois
 * de renderizar uma rota o limite ainda é o anterior (0 na primeira carga) e
 * cortaria a rolagem.
 */
export function refreshSmoothScroll(): void {
  lenis?.resize()
}

/** `immediate` pula o deslize do Lenis; sem Lenis a rolagem já é instantânea. */
export function scrollToTarget(
  target: HTMLElement,
  options: { immediate?: boolean } = {},
): void {
  // A rolagem anda em pixels inteiros e o topo do alvo pode cair numa fração
  // (seções com altura fracionária acima dele). Arredondar para baixo deixa o
  // topo dentro da janela, em vez de 0,4 px acima dela.
  const y = Math.floor(window.scrollY + flowTop(target))
  if (lenis) lenis.scrollTo(y, { immediate: options.immediate })
  else window.scrollTo(0, y)
}

/**
 * Topo do alvo na janela como se estivesse no fluxo. Preso (`sticky`, o
 * Contato do `Reveal`), o retângulo diz onde ele aparece agora, não onde a
 * página chega a ele.
 */
function flowTop(target: HTMLElement): number {
  if (getComputedStyle(target).position !== 'sticky')
    return target.getBoundingClientRect().top
  const inline = target.style.position
  target.style.position = 'static'
  const top = target.getBoundingClientRect().top
  target.style.position = inline
  return top
}

export function scrollToTop(): void {
  scrollToY(0)
}

/** Vai direto a uma posição, sem deslize (restaurar o voltar do navegador). */
export function scrollToY(y: number): void {
  if (lenis) lenis.scrollTo(y, { immediate: true })
  else window.scrollTo(0, y)
}
