import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ENTRANCE_EARLY_SCRIPT } from './entranceEarly.ts'

const html = document.documentElement

/** Executa o texto do script como o navegador o executaria no `<head>`. */
const run = () => new Function(ENTRANCE_EARLY_SCRIPT)()

function setScrollY(value: number) {
  Object.defineProperty(window, 'scrollY', { configurable: true, value })
}

function stubReduce(reduce: boolean) {
  vi.spyOn(window, 'matchMedia').mockImplementation(
    (query: string) =>
      ({
        matches: reduce && query === '(prefers-reduced-motion: reduce)',
        media: query,
      }) as MediaQueryList,
  )
}

beforeEach(() => {
  vi.useFakeTimers()
  setScrollY(0)
  window.history.replaceState(null, '', '/')
})

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
  delete html.dataset.entranceEarly
  window.history.replaceState(null, '', '/')
})

describe('ENTRANCE_EARLY_SCRIPT', () => {
  it('no topo, sem hash e sem reduce: pending, e expired depois de 3 s', () => {
    stubReduce(false)
    run()
    expect(html).toHaveAttribute('data-entrance-early', 'pending')
    vi.advanceTimersByTime(2999)
    expect(html).toHaveAttribute('data-entrance-early', 'pending')
    vi.advanceTimersByTime(1)
    expect(html).toHaveAttribute('data-entrance-early', 'expired')
  })

  it('se o Opening já tirou a marca, os 3 s não a põem de volta', () => {
    stubReduce(false)
    run()
    delete html.dataset.entranceEarly
    vi.advanceTimersByTime(3000)
    expect(html).not.toHaveAttribute('data-entrance-early')
  })

  it('com hash não marca', () => {
    stubReduce(false)
    window.history.replaceState(null, '', '/pt#contact')
    run()
    expect(html).not.toHaveAttribute('data-entrance-early')
  })

  it('com reduced motion não marca', () => {
    stubReduce(true)
    run()
    expect(html).not.toHaveAttribute('data-entrance-early')
  })

  it('já rolada não marca', () => {
    stubReduce(false)
    setScrollY(400)
    run()
    expect(html).not.toHaveAttribute('data-entrance-early')
  })

  it('é um texto fixo, sem interpolação (o CSP o hasheia)', () => {
    expect(ENTRANCE_EARLY_SCRIPT).not.toMatch(/<\/script|\$\{/)
    expect(ENTRANCE_EARLY_SCRIPT).toContain('3000')
  })
})
