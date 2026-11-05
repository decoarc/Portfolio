import { describe, expect, it } from 'vitest'
import {
  FIELD,
  createParticles,
  sampleSilhouette,
  stepParticles,
  type Pointer,
} from './dotField.ts'

const away: Pointer = { x: -1e4, y: -1e4, vx: 0, vy: 0, presence: 0 }

describe('sampleSilhouette', () => {
  it('só cria pontos onde há tinta', () => {
    const w = 20
    const h = 10
    const alpha = new Uint8Array(w * h)
    // Metade esquerda pintada.
    for (let y = 0; y < h; y++)
      for (let x = 0; x < 10; x++) alpha[y * w + x] = 255
    const { x } = sampleSilhouette(alpha, w, h, 2)
    expect(x.length).toBe(25)
    expect(Math.max(...x)).toBeLessThan(10)
  })
})

describe('stepParticles', () => {
  it('um ponto deslocado volta para casa sem o cursor', () => {
    const p = createParticles({ x: [50], y: [50] })
    p.x[0] = 90
    for (let i = 0; i < 600; i++) stepParticles(p, away, 0)
    expect(Math.abs(p.x[0]! - 50)).toBeLessThan(FIELD.breathe + 0.5)
  })

  it('o cursor por perto empurra o ponto para longe', () => {
    const p = createParticles({ x: [50], y: [50] })
    const near: Pointer = { x: 40, y: 50, vx: 0, vy: 0, presence: 1 }
    for (let i = 0; i < 10; i++) stepParticles(p, near, 0)
    expect(p.x[0]!).toBeGreaterThan(52)
  })

  it('o cursor em movimento arrasta o ponto na direção dele', () => {
    const p = createParticles({ x: [50], y: [50] })
    const sweep: Pointer = {
      x: 50,
      y: 50 + FIELD.radius * 0.5,
      vx: 0,
      vy: -30,
      presence: 1,
    }
    const still = createParticles({ x: [50], y: [50] })
    const pushOnly: Pointer = { ...sweep, vy: 0 }
    stepParticles(p, sweep, 0)
    stepParticles(still, pushOnly, 0)
    expect(p.y[0]!).toBeLessThan(still.y[0]!)
  })
})
