/**
 * Valores aprovados pelo dono para o texto que acende com o scroll (Fase 3,
 * segunda leva) e a conta do progresso. Fonte:
 * `docs/fase-3/prototipo/texto-acende.html` e a spec
 * `docs/superpowers/specs/2026-10-27-fase-3-texto-acende-design.md`.
 * O CSS de `LitText.module.css` repete `dim` e `soft`.
 */
export const SCROLL_LIT = {
  /** Opacidade da palavra apagada. */
  dim: 0.2,
  /** Quantas palavras ficam em transição ao mesmo tempo. */
  soft: 2.5,
  /** Começa quando o topo do parágrafo cruza esta fração da janela. */
  start: 0.8,
  /** Termina quando o fim do parágrafo cruza esta fração da janela. */
  end: 0.5,
} as const

export interface LitBox {
  top: number
  bottom: number
}

const clamp01 = (value: number): number => Math.min(1, Math.max(0, value))

/**
 * Progresso do parágrafo em palavras: 0 apagado, `words + soft` aceso por
 * inteiro. `remaining` é quanto ainda dá para rolar: se a página acaba antes
 * de o fim do parágrafo chegar à linha de término, a linha sobe até onde a
 * rolagem máxima o deixa, para nada ficar meio apagado para sempre.
 */
export function litProgress(
  box: LitBox,
  viewportHeight: number,
  remaining: number,
  words: number,
): number {
  const full = words + SCROLL_LIT.soft
  const endLine = Math.max(
    SCROLL_LIT.end * viewportHeight,
    box.bottom - Math.max(0, remaining),
  )
  const from = box.top - SCROLL_LIT.start * viewportHeight
  const to = box.bottom - endLine
  if (from === to) return from <= 0 ? full : 0
  return clamp01(from / (from - to)) * full
}
