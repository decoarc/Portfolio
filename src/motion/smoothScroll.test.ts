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

/** Uma seção cujo topo está em `top` px do início do documento (scrollY 0). */
function sectionAt(top: number) {
  const target = document.createElement('section')
  target.getBoundingClientRect = () => ({ top }) as DOMRect
  return target
}

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

  it('scrollToTarget com immediate repassa a opção ao Lenis', () => {
    setReducedMotion(false)
    startSmoothScroll()
    const target = sectionAt(100)
    scrollToTarget(target, { immediate: true })
    const instance = vi.mocked(Lenis).mock.instances[0] as unknown as {
      scrollTo: ReturnType<typeof vi.fn>
    }
    expect(instance.scrollTo).toHaveBeenCalledWith(100, { immediate: true })
  })

  it('scrollToTarget sem opção deixa o deslize ligado', () => {
    setReducedMotion(false)
    startSmoothScroll()
    const target = sectionAt(100)
    scrollToTarget(target)
    const instance = vi.mocked(Lenis).mock.instances[0] as unknown as {
      scrollTo: ReturnType<typeof vi.fn>
    }
    expect(instance.scrollTo).toHaveBeenCalledWith(100, {
      immediate: undefined,
    })
  })

  it('scrollToTarget arredonda para baixo: o topo do alvo fica na janela', () => {
    setReducedMotion(false)
    startSmoothScroll()
    scrollToTarget(sectionAt(2964.39), { immediate: true })
    const instance = vi.mocked(Lenis).mock.instances[0] as unknown as {
      scrollTo: ReturnType<typeof vi.fn>
    }
    expect(instance.scrollTo).toHaveBeenCalledWith(2964, { immediate: true })
  })
})

describe('sem Lenis', () => {
  it('scrollToTarget salta para o alvo, arredondando para baixo', () => {
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
    scrollToTarget(sectionAt(2964.39))
    expect(scrollTo).toHaveBeenCalledWith(0, 2964)
    scrollTo.mockRestore()
  })

  it('scrollToTop salta para o topo', () => {
    const spy = vi.spyOn(window, 'scrollTo')
    scrollToTop()
    expect(spy).toHaveBeenCalledWith(0, 0)
  })
})
