import { useEffect, type RefObject } from 'react'
import { prefersReducedMotion } from './reducedMotion.ts'

interface Box {
  left: number
  top: number
  width: number
  height: number
}

/** Puxão do link na direção do cursor: fração da distância ao centro. */
export function magnetOffset(
  pointer: { x: number; y: number },
  rect: Box,
): { x: number; y: number } {
  const dx = pointer.x - (rect.left + rect.width / 2)
  const dy = pointer.y - (rect.top + rect.height / 2)
  return { x: dx * 0.25, y: dy * 0.35 }
}

/**
 * Magnético: escreve `--magnet-x/--magnet-y` no elemento a cada movimento do
 * mouse sobre ele; o CSS faz o `translate`. Sem laço de rAF, sem toque nem
 * caneta, e nada com reduced motion.
 */
export function useMagnet(ref: RefObject<HTMLElement | null>): void {
  useEffect(() => {
    const el = ref.current
    if (!el || prefersReducedMotion()) return

    const write = (x: number, y: number) => {
      el.style.setProperty('--magnet-x', `${x}px`)
      el.style.setProperty('--magnet-y', `${y}px`)
    }
    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return
      const offset = magnetOffset(
        { x: event.clientX, y: event.clientY },
        el.getBoundingClientRect(),
      )
      write(offset.x, offset.y)
    }
    const onLeave = () => write(0, 0)

    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerleave', onLeave)
    return () => {
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerleave', onLeave)
      el.style.removeProperty('--magnet-x')
      el.style.removeProperty('--magnet-y')
    }
  }, [ref])
}
