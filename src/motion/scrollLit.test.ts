import { describe, expect, it } from 'vitest'
import { litProgress, SCROLL_LIT } from './scrollLit.ts'

// Janela de 1000 px e 10 palavras: aceso por inteiro = 10 + 2,5 = 12,5.
describe('litProgress', () => {
  it('usa os valores aprovados', () => {
    expect(SCROLL_LIT).toEqual({ dim: 0.2, soft: 2.5, start: 0.8, end: 0.5 })
  })

  it('apagado até o topo cruzar 80% da janela', () => {
    expect(litProgress({ top: 900, bottom: 1000 }, 1000, 5000, 10)).toBe(0)
    expect(litProgress({ top: 800, bottom: 900 }, 1000, 5000, 10)).toBe(0)
  })

  it('aceso quando o fim cruza 50% da janela, e depois', () => {
    expect(litProgress({ top: 400, bottom: 500 }, 1000, 5000, 10)).toBe(12.5)
    expect(litProgress({ top: -300, bottom: -200 }, 1000, 5000, 10)).toBe(12.5)
  })

  it('no meio do caminho, metade', () => {
    // from = 600 − 800 = −200; to = 700 − 500 = 200; t = 0,5
    expect(litProgress({ top: 600, bottom: 700 }, 1000, 5000, 10)).toBeCloseTo(
      6.25,
    )
  })

  it('fim da página: na rolagem máxima fica aceso mesmo abaixo de 50%', () => {
    expect(litProgress({ top: 700, bottom: 800 }, 1000, 0, 10)).toBe(12.5)
    expect(litProgress({ top: 900, bottom: 1000 }, 1000, 0, 10)).toBe(12.5)
  })

  it('fim da página: a linha de término é estável enquanto se rola até lá', () => {
    // Na rolagem máxima o fim do parágrafo para em 800 − 200 = 600 (> 500).
    expect(litProgress({ top: 900, bottom: 1000 }, 1000, 200, 10)).toBe(0)
    // Mesma linha de término (850 − 50 = 800): from = −50, to = 50, t = 0,5.
    expect(litProgress({ top: 750, bottom: 850 }, 1000, 50, 10)).toBeCloseTo(
      6.25,
    )
  })

  it('remaining negativo (overscroll) conta como 0', () => {
    expect(litProgress({ top: 700, bottom: 800 }, 1000, -40, 10)).toBe(12.5)
  })
})
