import type { Pointer } from './dotField.ts'

/**
 * O cursor visto por um campo de pontos (`DotField`, `CubeField`): posição
 * relativa ao canvas, velocidade em px/frame e uma presença que sobe e desce
 * suave. Os ouvintes ficam na `window`, porque o canvas não recebe eventos.
 */
export interface PointerTracker {
  pointer: Pointer
  /** 1 com o cursor perto do canvas, 0 longe. */
  readonly target: number
  /** Um passo de suavização (presença sobe/desce, velocidade decai). */
  ease(dt: number): void
  dispose(): void
}

/** Margem em volta do canvas onde o cursor já conta como presente, em px. */
const MARGIN = 80

/**
 * `onEnter` é chamado quando o cursor chega perto: o campo acorda o laço.
 */
export function trackPointer(
  canvas: HTMLCanvasElement,
  onEnter: () => void,
): PointerTracker {
  const pointer: Pointer = { x: -1e4, y: -1e4, vx: 0, vy: 0, presence: 0 }
  let target = 0
  let lastMove = { x: 0, y: 0, t: 0 }

  const onMove = (event: PointerEvent) => {
    const rect = canvas.getBoundingClientRect()
    const px = event.clientX - rect.left
    const py = event.clientY - rect.top
    target =
      px > -MARGIN &&
      py > -MARGIN &&
      px < rect.width + MARGIN &&
      py < rect.height + MARGIN
        ? 1
        : 0
    const t = event.timeStamp
    const elapsed = Math.max(t - lastMove.t, 1)
    if (lastMove.t && elapsed < 100) {
      const scale = 1000 / 60 / elapsed
      pointer.vx = (event.clientX - lastMove.x) * scale
      pointer.vy = (event.clientY - lastMove.y) * scale
    }
    lastMove = { x: event.clientX, y: event.clientY, t }
    pointer.x = px
    pointer.y = py
    if (target) onEnter()
  }
  const onLeave = () => {
    target = 0
    // Sem isso, o próximo toque em outro lugar viraria um "salto" de
    // velocidade e arrastaria os pontos.
    lastMove = { x: 0, y: 0, t: 0 }
  }
  // Toque e caneta não têm hover: o dedo só "existe" enquanto encosta. No
  // `pointerdown` o ponto empurra na hora (um tap sozinho não gera
  // `pointermove`); no `pointerup`/`pointercancel` (o navegador assumiu a
  // rolagem) a presença solta, senão os pontos ficariam afastados do último
  // toque. O mouse segue só com `pointermove`/`pointerleave`.
  const onDown = (event: PointerEvent) => {
    if (event.pointerType === 'mouse') return
    onMove(event)
    if (target) pointer.presence = Math.max(pointer.presence, 0.6)
  }
  const onUp = (event: PointerEvent) => {
    if (event.pointerType !== 'mouse') onLeave()
  }

  window.addEventListener('pointermove', onMove, { passive: true })
  window.addEventListener('pointerdown', onDown, { passive: true })
  window.addEventListener('pointerup', onUp, { passive: true })
  window.addEventListener('pointercancel', onUp, { passive: true })
  document.documentElement.addEventListener('pointerleave', onLeave)

  return {
    pointer,
    get target() {
      return target
    },
    ease(dt) {
      pointer.presence += (target - pointer.presence) * 0.08 * dt
      // A velocidade do cursor decai quando ele para.
      pointer.vx *= 0.85
      pointer.vy *= 0.85
    },
    dispose() {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
      document.documentElement.removeEventListener('pointerleave', onLeave)
    },
  }
}
