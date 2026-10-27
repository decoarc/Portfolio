import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  canFly,
  forgetTitleFlightOnTraversal,
  markTitleFlight,
  TITLE_FLIGHT,
} from './titleFlight.ts'

function stubMatchMedia(reduce: boolean) {
  vi.stubGlobal(
    'matchMedia',
    vi.fn((query: string) => ({
      matches: reduce && query.includes('reduce'),
      media: query,
    })),
  )
}

function stubStartViewTransition() {
  Object.defineProperty(document, 'startViewTransition', {
    configurable: true,
    value: vi.fn(),
  })
}

afterEach(() => {
  vi.unstubAllGlobals()
  Reflect.deleteProperty(document, 'startViewTransition')
  delete document.documentElement.dataset.titleFlight
})

describe('titleFlight', () => {
  it('nomes de transição do título e do resto do case', () => {
    expect(TITLE_FLIGHT).toEqual({
      title: 'case-title',
      back: 'case-back',
      head: 'case-head',
      body: 'case-body',
    })
  })

  it('markTitleFlight marca o sentido na raiz', () => {
    markTitleFlight('open')
    expect(document.documentElement.dataset.titleFlight).toBe('open')
    markTitleFlight('close')
    expect(document.documentElement.dataset.titleFlight).toBe('close')
  })

  it('canFly: falso sem startViewTransition (jsdom)', () => {
    stubMatchMedia(false)
    expect(canFly()).toBe(false)
  })

  it('canFly: verdadeiro com startViewTransition e sem reduced motion', () => {
    stubStartViewTransition()
    stubMatchMedia(false)
    expect(canFly()).toBe(true)
  })

  it('canFly: falso com startViewTransition e reduced motion', () => {
    stubStartViewTransition()
    stubMatchMedia(true)
    expect(canFly()).toBe(false)
  })

  it('voltar/avançar do navegador apaga a marca: troca direta', () => {
    const stop = forgetTitleFlightOnTraversal()
    markTitleFlight('open')
    window.dispatchEvent(new PopStateEvent('popstate'))
    expect(document.documentElement.dataset.titleFlight).toBeUndefined()
    stop()
    markTitleFlight('open')
    window.dispatchEvent(new PopStateEvent('popstate'))
    expect(document.documentElement.dataset.titleFlight).toBe('open')
  })
})
