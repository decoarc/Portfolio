import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { usePrefersReducedMotion } from './usePrefersReducedMotion'

describe('usePrefersReducedMotion', () => {
  let matches = false
  let changeHandler: (() => void) | null = null

  beforeEach(() => {
    matches = true
    changeHandler = null
    vi.stubGlobal(
      'matchMedia',
      vi.fn(() => ({
        get matches() {
          return matches
        },
        media: '(prefers-reduced-motion: reduce)',
        onchange: null,
        addEventListener: (_type: string, listener: () => void) => {
          changeHandler = listener
        },
        removeEventListener: () => {
          changeHandler = null
        },
        addListener: () => undefined,
        removeListener: () => undefined,
        dispatchEvent: () => true,
      })),
    )
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('reads the initial reduced-motion preference', () => {
    const { result } = renderHook(() => usePrefersReducedMotion())
    expect(result.current).toBe(true)
  })

  it('updates when the media query changes', () => {
    const { result } = renderHook(() => usePrefersReducedMotion())
    expect(result.current).toBe(true)

    act(() => {
      matches = false
      changeHandler?.()
    })

    expect(result.current).toBe(false)
  })
})
