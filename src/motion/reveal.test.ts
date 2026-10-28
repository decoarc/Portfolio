import { describe, expect, it } from 'vitest'
import { revealFrame, revealProgress } from './reveal.ts'

describe('revealProgress', () => {
  it('é a fração do Contato já revelada, entre 0 e 1', () => {
    expect(revealProgress(900, 900, 600)).toBe(0)
    expect(revealProgress(600, 900, 600)).toBe(0.5)
    expect(revealProgress(300, 900, 600)).toBe(1)
  })

  it('fica entre 0 e 1 fora da faixa', () => {
    expect(revealProgress(1500, 900, 600)).toBe(0)
    expect(revealProgress(-200, 900, 600)).toBe(1)
  })

  it('Contato sem altura não divide por zero', () => {
    expect(revealProgress(900, 900, 0)).toBe(0)
    expect(revealProgress(800, 900, 0)).toBe(1)
  })
})

describe('revealFrame', () => {
  it('no começo: sem curva, Contato na sombra', () => {
    expect(revealFrame(0, 1440)).toEqual({ curveVh: 0, shadeOpacity: 0.9 })
  })

  it('curva máxima no meio: 14 vh a partir de 768 px e 7 vh abaixo', () => {
    expect(revealFrame(0.5, 1440).curveVh).toBeCloseTo(14)
    expect(revealFrame(0.5, 768).curveVh).toBeCloseTo(14)
    expect(revealFrame(0.5, 767).curveVh).toBeCloseTo(7)
  })

  it('no fim: borda reta e sem sombra', () => {
    const frame = revealFrame(1, 1440)
    expect(frame.curveVh).toBeCloseTo(0)
    expect(frame.shadeOpacity).toBe(0)
  })
})
