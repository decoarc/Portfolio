import { describe, expect, it } from 'vitest'
import {
  MIN_THUMB,
  currentMark,
  railMetrics,
  scrollForPoint,
} from './scrollRail.ts'

describe('railMetrics', () => {
  it('ocupa o trilho inteiro quando a página cabe na janela', () => {
    expect(railMetrics(0, 800, 800)).toEqual({ size: 1, offset: 0 })
  })

  it('mede o marcador pela fração visível e o desloca pelo progresso', () => {
    expect(railMetrics(0, 4000, 1000)).toEqual({ size: 0.25, offset: 0 })
    expect(railMetrics(3000, 4000, 1000)).toEqual({ size: 0.25, offset: 0.75 })
    expect(railMetrics(1500, 4000, 1000).offset).toBeCloseTo(0.375)
  })

  it('não deixa o marcador menor que o mínimo nem passar das pontas', () => {
    const long = railMetrics(999_999, 100_000, 1000)
    expect(long.size).toBe(MIN_THUMB)
    expect(long.offset).toBeCloseTo(1 - MIN_THUMB)
    expect(railMetrics(-50, 4000, 1000).offset).toBe(0)
  })
})

describe('scrollForPoint', () => {
  it('centra o marcador no ponto clicado', () => {
    // meio do trilho → meio da rolagem
    expect(scrollForPoint(0.5, 0.25, 4000, 1000)).toBe(1500)
  })

  it('prende nas pontas', () => {
    expect(scrollForPoint(0, 0.25, 4000, 1000)).toBe(0)
    expect(scrollForPoint(1, 0.25, 4000, 1000)).toBe(3000)
  })

  it('não rola uma página que cabe na janela', () => {
    expect(scrollForPoint(0.8, 1, 800, 800)).toBe(0)
  })
})

describe('currentMark', () => {
  const marks = [600, 1400, 2600]

  it('é -1 antes da primeira seção', () => {
    expect(currentMark(0, marks)).toBe(-1)
  })

  it('é a última seção cujo topo já passou', () => {
    expect(currentMark(600, marks)).toBe(0)
    expect(currentMark(2000, marks)).toBe(1)
    expect(currentMark(9000, marks)).toBe(2)
  })

  it('tolera o arredondamento de meio pixel do scrollToTarget', () => {
    expect(currentMark(1399.4, marks)).toBe(1)
  })
})
