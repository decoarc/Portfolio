/**
 * Valores aprovados pelo dono para a abertura da home (Fase 3) e as contas de
 * um frame. Fonte: `docs/fase-3/prototipo/` e a spec da Fase 3.
 */
export const OPENING = {
  mobileMaxWidth: 767,
  desktop: { driftVw: 25, curveVh: 14 },
  mobile: { driftVw: 40, curveVh: 7 },
  heroMinScale: 0.94,
  shadeMax: 0.9,
  bottomShiftVh: 6,
  bottomFade: 1.4,
} as const

export interface OpeningFrame {
  /** Deslocamento de cada palavra do nome; o sinal é aplicado no CSS. */
  driftVw: number
  /** Quanto o bloco de baixo do hero sobe (positivo = para cima). */
  bottomShiftVh: number
  bottomOpacity: number
  heroScale: number
  shadeOpacity: number
  curveVh: number
}

const clamp01 = (value: number): number => Math.min(1, Math.max(0, value))

const easeOutCubic = (t: number): number => 1 - (1 - t) ** 3

/** Fração da primeira tela já rolada: 0 no topo, 1 depois de uma altura de janela. */
export function openingProgress(
  scrollY: number,
  viewportHeight: number,
): number {
  if (viewportHeight <= 0) return scrollY > 0 ? 1 : 0
  return clamp01(scrollY / viewportHeight)
}

export function openingFrame(
  progress: number,
  viewportWidth: number,
): OpeningFrame {
  const p = clamp01(progress)
  const size =
    viewportWidth <= OPENING.mobileMaxWidth ? OPENING.mobile : OPENING.desktop
  return {
    driftVw: easeOutCubic(p) * size.driftVw,
    bottomShiftVh: p * OPENING.bottomShiftVh,
    bottomOpacity: Math.max(0, 1 - p * OPENING.bottomFade),
    heroScale: 1 - p * (1 - OPENING.heroMinScale),
    shadeOpacity: p * OPENING.shadeMax,
    curveVh: Math.sin(Math.PI * p) * size.curveVh,
  }
}
