import { describe, expect, it } from 'vitest'
import { fadeOpacity, openingFrame, openingProgress } from './opening.ts'

describe('openingProgress', () => {
  it('é a fração da altura da janela já rolada, entre 0 e 1', () => {
    expect(openingProgress(0, 900)).toBe(0)
    expect(openingProgress(450, 900)).toBe(0.5)
    expect(openingProgress(5000, 900)).toBe(1)
  })

  it('ignora o overscroll do iOS', () => {
    expect(openingProgress(-40, 900)).toBe(0)
  })

  it('janela sem altura não divide por zero', () => {
    expect(openingProgress(100, 0)).toBe(1)
  })
})

describe('openingFrame', () => {
  it('no topo, o nome no lugar', () => {
    expect(openingFrame(0, 1440)).toEqual({ driftVw: 0 })
  })

  it('afastamento de 25 vw a partir de 768 px e 40 vw abaixo', () => {
    expect(openingFrame(1, 1440).driftVw).toBe(25)
    expect(openingFrame(1, 390).driftVw).toBe(40)
    expect(openingFrame(1, 767).driftVw).toBe(40)
    expect(openingFrame(1, 768).driftVw).toBe(25)
  })

  it('afastamento segue easeOutCubic', () => {
    expect(openingFrame(0.5, 1440).driftVw).toBeCloseTo(25 * (1 - 0.5 ** 3))
  })
})

describe('fadeOpacity', () => {
  it('cai linearmente até sumir no alvo', () => {
    expect(fadeOpacity(0, 13)).toBe(1)
    expect(fadeOpacity(6.5, 13)).toBe(0.5)
    expect(fadeOpacity(13, 13)).toBe(0)
    expect(fadeOpacity(25, 13)).toBe(0)
  })

  it('alvo já alcançado no lugar: some no primeiro movimento', () => {
    expect(fadeOpacity(0, -2)).toBe(1)
    expect(fadeOpacity(0.1, -2)).toBe(0)
  })

  it('sem palavra medida, não some', () => {
    expect(fadeOpacity(25, Infinity)).toBe(1)
  })
})
