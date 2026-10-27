import { useEffect, type RefObject } from 'react'

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
 * caneta, e nada com reduced motion — lido a cada movimento e escutado: ligar
 * o reduce no meio da sessão zera o puxão na hora.
 */
export function useMagnet(ref: RefObject<HTMLElement | null>): void {
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const query =
      typeof window.matchMedia === 'function'
        ? window.matchMedia('(prefers-reduced-motion: reduce)')
        : null

    const write = (x: number, y: number) => {
      el.style.setProperty('--magnet-x', `${x}px`)
      el.style.setProperty('--magnet-y', `${y}px`)
    }
    const clear = () => {
      el.style.removeProperty('--magnet-x')
      el.style.removeProperty('--magnet-y')
    }
    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse' || query?.matches) return
      const offset = magnetOffset(
        { x: event.clientX, y: event.clientY },
        el.getBoundingClientRect(),
      )
      write(offset.x, offset.y)
    }
    const onLeave = () => {
      if (!query?.matches) write(0, 0)
    }
    const onQueryChange = () => {
      if (query?.matches) clear()
    }

    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerleave', onLeave)
    query?.addEventListener('change', onQueryChange)
    return () => {
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerleave', onLeave)
      query?.removeEventListener('change', onQueryChange)
      clear()
    }
  }, [ref])
}
