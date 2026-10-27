import { afterEach, describe, expect, it, vi } from 'vitest'
import Lenis from 'lenis'
import {
  isSmoothScrollActive,
  refreshSmoothScroll,
  scrollToTarget,
  scrollToTop,
  startSmoothScroll,
  stopSmoothScroll,
} from './smoothScroll.ts'

vi.mock('lenis', () => ({
  default: vi.fn(
    class {
      on = vi.fn(() => () => undefined)
      scrollTo = vi.fn()
      resize = vi.fn()
      destroy = vi.fn()
    },
  ),
}))

const originalMatchMedia = window.matchMedia

function setReducedMotion(reduce: boolean) {
  window.matchMedia = ((query: string) => ({
    ...originalMatchMedia(query),
    matches: reduce && query.includes('prefers-reduced-motion: reduce'),
  })) as typeof window.matchMedia
}

afterEach(() => {
  stopSmoothScroll()
  window.matchMedia = originalMatchMedia
  vi.mocked(Lenis).mockClear()
  vi.restoreAllMocks()
})

describe('startSmoothScroll', () => {
  it('não inicia com reduced motion', () => {
    setReducedMotion(true)
    expect(startSmoothScroll()).toBe(false)
    expect(isSmoothScrollActive()).toBe(false)
    expect(Lenis).not.toHaveBeenCalled()
  })

  it('cria uma única instância mesmo chamado duas vezes', () => {
    setReducedMotion(false)
    expect(startSmoothScroll()).toBe(true)
    expect(startSmoothScroll()).toBe(true)
    expect(isSmoothScrollActive()).toBe(true)
    expect(Lenis).toHaveBeenCalledTimes(1)
  })
})

describe('com Lenis', () => {
  it('refreshSmoothScroll remede a página na hora', () => {
    setReducedMotion(false)
    startSmoothScroll()
    refreshSmoothScroll()
    const instance = vi.mocked(Lenis).mock.instances[0] as unknown as {
      resize: ReturnType<typeof vi.fn>
    }
    expect(instance.resize).toHaveBeenCalledTimes(1)
  })
})

describe('sem Lenis', () => {
  it('scrollToTarget salta para o alvo', () => {
    const target = document.createElement('section')
    target.scrollIntoView = vi.fn()
    scrollToTarget(target)
    expect(target.scrollIntoView).toHaveBeenCalledWith({ block: 'start' })
  })

  it('scrollToTop salta para o topo', () => {
    const spy = vi.spyOn(window, 'scrollTo')
    scrollToTop()
    expect(spy).toHaveBeenCalledWith(0, 0)
  })
})
