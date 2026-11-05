import { describe, expect, it } from 'vitest'
import { decodeCloud, fitCloud } from './pointClouds.ts'

describe('decodeCloud', () => {
  it('volta de Int16 para a escala de -1 a 1', () => {
    const raw = Int16Array.from([32767, -32767, 0, 16384, 0, -16384])
    const l = decodeCloud(raw.buffer)
    expect(l.count).toBe(2)
    expect(l.x[0]).toBeCloseTo(1)
    expect(l.y[0]).toBeCloseTo(-1)
    expect(l.x[1]).toBeCloseTo(0.5, 3)
  })
})

describe('fitCloud', () => {
  const cloud = decodeCloud(Int16Array.from([1, 2, 3, 4, 5, 6]).buffer)

  it('corta ou repete para chegar ao número de pontos do cubo', () => {
    expect(fitCloud(cloud, 1).count).toBe(1)
    const long = fitCloud(cloud, 5)
    expect(long.count).toBe(5)
    expect(long.x[4]).toBe(long.x[0])
  })

  it('aplica a escala do modelo', () => {
    expect(fitCloud(cloud, 1, 2).y[0]).toBeCloseTo(cloud.y[0]! * 2)
  })
})
