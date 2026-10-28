/**
 * Fim da home: o Sobre sobe e revela o Contato, preso por baixo, com a borda
 * de baixo curvada. Valores aprovados pelo dono em 2026-10-28
 * (`docs/fase-3/prototipo/hero-e-contato.html`); a curva tem a altura da que
 * antes abria a home.
 */
export const REVEAL = {
  mobileMaxWidth: 767,
  desktopCurveVh: 14,
  mobileCurveVh: 7,
  shadeMax: 0.9,
} as const

export interface RevealFrame {
  /** Altura da borda curva do Sobre, em vh. */
  curveVh: number
  /** Opacidade da sombra sobre o Contato ainda coberto. */
  shadeOpacity: number
}

const clamp01 = (value: number): number => Math.min(1, Math.max(0, value))

/**
 * Progresso da revelação: 0 com a base do Sobre na base da janela, 1 com o
 * Contato (preso no pé da janela) todo à vista.
 */
export function revealProgress(
  upperBottom: number,
  viewportHeight: number,
  lowerHeight: number,
): number {
  if (lowerHeight <= 0) return upperBottom < viewportHeight ? 1 : 0
  return clamp01((viewportHeight - upperBottom) / lowerHeight)
}

export function revealFrame(
  progress: number,
  viewportWidth: number,
): RevealFrame {
  const p = clamp01(progress)
  const curve =
    viewportWidth <= REVEAL.mobileMaxWidth
      ? REVEAL.mobileCurveVh
      : REVEAL.desktopCurveVh
  return {
    curveVh: Math.sin(Math.PI * p) * curve,
    shadeOpacity: (1 - p) * REVEAL.shadeMax,
  }
}
