import { fireEvent, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { magnetOffset, useMagnet } from './magnet.ts'

const rect = { left: 100, top: 50, width: 200, height: 40 } // centro (200, 70)

describe('magnetOffset', () => {
  it('puxa 0,25 × dx e 0,35 × dy na direção do cursor', () => {
    expect(magnetOffset({ x: 260, y: 90 }, rect)).toEqual({ x: 15, y: 7 })
    expect(magnetOffset({ x: 140, y: 50 }, rect)).toEqual({ x: -15, y: -7 })
  })

  it('no centro não move', () => {
    expect(magnetOffset({ x: 200, y: 70 }, rect)).toEqual({ x: 0, y: 0 })
  })
})

/** Um `<a>` real no documento, com a caixa do `rect` acima. */
function anchor() {
  const el = document.createElement('a')
  el.getBoundingClientRect = () =>
    ({
      ...rect,
      x: rect.left,
      y: rect.top,
      right: rect.left + rect.width,
      bottom: rect.top + rect.height,
      toJSON: () => rect,
    }) as DOMRect
  document.body.append(el)
  return el
}

/**
 * O jsdom não tem `PointerEvent`: o `fireEvent` cai num `Event` genérico e
 * descarta `pointerType` e `clientX/Y`. Um `MouseEvent` com `pointerType`
 * definido à mão faz o papel.
 */
function pointer(type: string, pointerType: string, x = 260, y = 90) {
  const event = new MouseEvent(type, { clientX: x, clientY: y })
  Object.defineProperty(event, 'pointerType', { value: pointerType })
  return event
}

describe('useMagnet', () => {
  afterEach(() => {
    document.body.innerHTML = ''
    vi.restoreAllMocks()
  })

  it('mouse escreve --magnet-x/--magnet-y em px', () => {
    const el = anchor()
    renderHook(() => useMagnet({ current: el }))
    fireEvent(el, pointer('pointermove', 'mouse'))
    expect(el.style.getPropertyValue('--magnet-x')).toBe('15px')
    expect(el.style.getPropertyValue('--magnet-y')).toBe('7px')
  })

  it('toque e caneta não movem', () => {
    const el = anchor()
    renderHook(() => useMagnet({ current: el }))
    fireEvent(el, pointer('pointermove', 'touch'))
    fireEvent(el, pointer('pointermove', 'pen'))
    expect(el.style.getPropertyValue('--magnet-x')).toBe('')
    expect(el.style.getPropertyValue('--magnet-y')).toBe('')
  })

  it('pointerleave volta a 0', () => {
    const el = anchor()
    renderHook(() => useMagnet({ current: el }))
    fireEvent(el, pointer('pointermove', 'mouse'))
    fireEvent(el, pointer('pointerleave', 'mouse'))
    expect(el.style.getPropertyValue('--magnet-x')).toBe('0px')
    expect(el.style.getPropertyValue('--magnet-y')).toBe('0px')
  })

  it('com reduced motion não escuta', () => {
    const original = window.matchMedia
    vi.spyOn(window, 'matchMedia').mockImplementation((query: string) => ({
      ...original(query),
      matches: query.includes('reduce'),
    }))
    const el = anchor()
    renderHook(() => useMagnet({ current: el }))
    fireEvent(el, pointer('pointermove', 'mouse'))
    expect(el.style.getPropertyValue('--magnet-x')).toBe('')
  })

  it('reduced motion ligado no meio da sessão zera e para de escrever', () => {
    const listeners = new Set<() => void>()
    const query = {
      matches: false,
      media: '(prefers-reduced-motion: reduce)',
      onchange: null,
      addEventListener: (_type: string, listener: () => void) =>
        listeners.add(listener),
      removeEventListener: (_type: string, listener: () => void) =>
        listeners.delete(listener),
      addListener: () => undefined,
      removeListener: () => undefined,
      dispatchEvent: () => true,
    }
    vi.spyOn(window, 'matchMedia').mockImplementation(
      () => query as unknown as MediaQueryList,
    )
    const el = anchor()
    const { unmount } = renderHook(() => useMagnet({ current: el }))
    fireEvent(el, pointer('pointermove', 'mouse'))
    expect(el.style.getPropertyValue('--magnet-x')).toBe('15px')

    query.matches = true
    listeners.forEach((listener) => listener())
    expect(el.style.getPropertyValue('--magnet-x')).toBe('')
    expect(el.style.getPropertyValue('--magnet-y')).toBe('')
    fireEvent(el, pointer('pointermove', 'mouse'))
    expect(el.style.getPropertyValue('--magnet-x')).toBe('')

    query.matches = false
    listeners.forEach((listener) => listener())
    fireEvent(el, pointer('pointermove', 'mouse'))
    expect(el.style.getPropertyValue('--magnet-x')).toBe('15px')

    unmount()
    expect(listeners.size).toBe(0)
  })

  it('desmontar remove os listeners e zera', () => {
    const el = anchor()
    const { unmount } = renderHook(() => useMagnet({ current: el }))
    fireEvent(el, pointer('pointermove', 'mouse'))
    unmount()
    expect(el.style.getPropertyValue('--magnet-x')).toBe('')
    expect(el.style.getPropertyValue('--magnet-y')).toBe('')
    fireEvent(el, pointer('pointermove', 'mouse'))
    expect(el.style.getPropertyValue('--magnet-x')).toBe('')
  })
})
