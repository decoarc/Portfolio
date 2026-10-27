import { prefersReducedMotion } from './reducedMotion.ts'

/**
 * Título que viaja: a View Transition entre a ficha e o case study. Os nomes
 * de transição são únicos na página; o tempo e as curvas ficam em
 * `titleFlight.css`, nos pseudo-elementos `::view-transition-*`.
 */
export const TITLE_FLIGHT = {
  title: 'case-title',
  back: 'case-back',
  head: 'case-head',
  body: 'case-body',
} as const

/** `open`: da ficha para o case; `close`: do case de volta à ficha. */
export type FlightDirection = 'open' | 'close'

/** Marca o sentido na raiz, para o CSS escolher qual foto do título mostrar. */
export function markTitleFlight(direction: FlightDirection): void {
  document.documentElement.dataset.titleFlight = direction
}

/** A viagem só roda com View Transitions e sem reduced motion. */
export function canFly(): boolean {
  return (
    typeof document !== 'undefined' &&
    typeof document.startViewTransition === 'function' &&
    !prefersReducedMotion()
  )
}

/**
 * Voltar/avançar do navegador é troca direta. O router repete sozinho a View
 * Transition entre duas páginas que já viajaram (também nesse caso); sem a
 * marca, `titleFlight.css` deixa essa transição sem animação. O `popstate`
 * chega antes de o router trocar a rota, então a marca some a tempo.
 */
export function forgetTitleFlightOnTraversal(): () => void {
  const forget = () => {
    delete document.documentElement.dataset.titleFlight
  }
  window.addEventListener('popstate', forget)
  return () => window.removeEventListener('popstate', forget)
}
