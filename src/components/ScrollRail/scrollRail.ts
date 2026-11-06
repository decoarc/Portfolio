/** Medidas puras do trilho de rolagem (sem DOM), para testar sem navegador. */

export interface RailMetrics {
  /** Altura do marcador, em fração do trilho (0–1). */
  size: number
  /** Topo do marcador, em fração do trilho (0–1). */
  offset: number
}

/** Abaixo disto o marcador some na ponta do dedo. Fração do trilho. */
export const MIN_THUMB = 0.06

export function railMetrics(
  scrollY: number,
  scrollHeight: number,
  viewportHeight: number,
): RailMetrics {
  const max = scrollHeight - viewportHeight
  if (max <= 0 || scrollHeight <= 0) return { size: 1, offset: 0 }
  const size = Math.max(MIN_THUMB, Math.min(1, viewportHeight / scrollHeight))
  const progress = clamp(scrollY / max, 0, 1)
  return { size, offset: progress * (1 - size) }
}

/**
 * Posição de rolagem para um ponto do trilho (`fraction`, 0–1), com o centro
 * do marcador sobre o ponto — como um clique no meio de um filete de papel.
 */
export function scrollForPoint(
  fraction: number,
  size: number,
  scrollHeight: number,
  viewportHeight: number,
): number {
  const max = scrollHeight - viewportHeight
  if (max <= 0 || size >= 1) return 0
  const progress = clamp((fraction - size / 2) / (1 - size), 0, 1)
  return Math.round(progress * max)
}

/** Índice da última marca que o topo da janela já passou; -1 antes da primeira. */
export function currentMark(scrollY: number, marks: readonly number[]): number {
  let current = -1
  for (let i = 0; i < marks.length; i++) {
    if (scrollY + 1 >= marks[i]) current = i
  }
  return current
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}
