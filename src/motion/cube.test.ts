import { describe, expect, it } from 'vitest'
import {
  applyScatter,
  blendLattice,
  createScatter,
  cubeLattice,
  explosion,
  projectLattice,
  scatterAmount,
  type View,
} from './cube.ts'

describe('cubeLattice', () => {
  it('põe n×n pontos em cada uma das seis faces', () => {
    const l = cubeLattice(5)
    expect(l.count).toBe(6 * 25)
    for (let i = 0; i < l.count; i++) {
      const m = Math.max(
        Math.abs(l.x[i]!),
        Math.abs(l.y[i]!),
        Math.abs(l.z[i]!),
      )
      expect(m).toBeCloseTo(1)
    }
  })
})

describe('projectLattice', () => {
  const l = cubeLattice(4)
  const project = (view: View) => {
    const x = new Float32Array(l.count)
    const y = new Float32Array(l.count)
    const d = new Float32Array(l.count)
    projectLattice(l, view, x, y, d)
    return { x, y, d }
  }
  const base: View = { yaw: 0.3, pitch: 0.4, size: 100, cx: 200, cy: 150 }

  it('uma volta inteira volta ao mesmo quadro', () => {
    const a = project(base)
    const b = project({ ...base, yaw: base.yaw + Math.PI * 2 })
    for (let i = 0; i < l.count; i++) {
      expect(b.x[i]).toBeCloseTo(a.x[i]!, 3)
      expect(b.y[i]).toBeCloseTo(a.y[i]!, 3)
    }
  })

  it('fica centrado e dentro do alcance da meia diagonal', () => {
    const { x, y, d } = project(base)
    const mean = x.reduce((s, v) => s + v, 0) / l.count
    expect(mean).toBeCloseTo(200, 0)
    for (let i = 0; i < l.count; i++) {
      expect(Math.hypot(x[i]! - 200, y[i]! - 150)).toBeLessThan(100 * 2)
      expect(d[i]).toBeGreaterThanOrEqual(0)
      expect(d[i]).toBeLessThanOrEqual(1)
    }
  })

  it('a face voltada para a câmera fica na frente', () => {
    const { d } = project({ ...base, yaw: 0, pitch: 0 })
    // z = -1 está do lado da câmera.
    const front = Array.from(l.z).findIndex((z) => z === -1)
    const back = Array.from(l.z).findIndex((z) => z === 1)
    expect(d[front]!).toBeGreaterThan(d[back]!)
  })
})

describe('applyScatter', () => {
  const view = { cx: 100, cy: 100, size: 50 }
  const s = createScatter(3)
  const homes = () => ({
    x: Float32Array.from([90, 100, 130]),
    y: Float32Array.from([100, 80, 120]),
  })

  it('sem scroll, as casas ficam onde estão', () => {
    const h = homes()
    applyScatter(h.x, h.y, s, 0, view)
    expect(Array.from(h.x)).toEqual(Array.from(homes().x))
  })

  it('no fim do scroll, todo ponto saiu do lugar', () => {
    const h = homes()
    applyScatter(h.x, h.y, s, 1, view)
    const base = homes()
    for (let i = 0; i < 3; i++) {
      expect(
        Math.hypot(h.x[i]! - base.x[i]!, h.y[i]! - base.y[i]!),
      ).toBeGreaterThan(10)
    }
  })

  it('o avanço de cada ponto só cresce com o scroll', () => {
    let prev = 0
    for (let p = 0; p <= 1.0001; p += 0.05) {
      const e = scatterAmount(p, 0.5)
      expect(e).toBeGreaterThanOrEqual(prev)
      prev = e
    }
    expect(scatterAmount(1, 1)).toBe(1)
    expect(scatterAmount(0, 0)).toBe(0)
  })
})

describe('explosion', () => {
  it('o raio só cresce, do cubo inteiro até o estouro completo', () => {
    expect(explosion(0)).toEqual({ radial: 1, burst: 0 })
    let prev = 1
    for (let e = 0.1; e <= 1.0001; e += 0.1) {
      const { radial } = explosion(Math.min(e, 1))
      expect(radial).toBeGreaterThan(prev)
      prev = radial
    }
    expect(explosion(1)).toEqual({ radial: expect.any(Number), burst: 1 })
    expect(explosion(1).radial).toBeGreaterThan(2)
  })

  it('logo no começo do scroll, os pontos já se afastam do centro', () => {
    const view = { cx: 100, cy: 100, size: 50 }
    const x = Float32Array.from([40, 160, 100])
    const y = Float32Array.from([100, 130, 30])
    const before = Array.from(x, (v, i) => Math.hypot(v - 100, y[i]! - 100))
    applyScatter(x, y, createScatter(3), 0.2, view)
    x.forEach((v, i) => {
      expect(Math.hypot(v - 100, y[i]! - 100)).toBeGreaterThan(before[i]!)
    })
  })
})

describe('blendLattice', () => {
  const from = cubeLattice(3)
  const to = {
    x: from.x.map((v) => -v),
    y: from.y.map((v) => v * 0.5),
    z: from.z.slice(),
    count: from.count,
  }
  const out = () => ({
    x: new Float32Array(from.count),
    y: new Float32Array(from.count),
    z: new Float32Array(from.count),
    count: from.count,
  })

  it('começa na forma de origem e termina na de destino', () => {
    const a = out()
    blendLattice(from, to, 0, a)
    expect(Array.from(a.x)).toEqual(Array.from(from.x))
    const b = out()
    blendLattice(from, to, 1, b)
    for (let i = 0; i < from.count; i++) {
      expect(b.x[i]).toBeCloseTo(to.x[i]!)
      expect(b.y[i]).toBeCloseTo(to.y[i]!)
    }
  })

  it('no meio, os pontos estão entre uma forma e outra', () => {
    const m = out()
    blendLattice(from, to, 0.5, m)
    const moved = Array.from(m.x).filter(
      (v, i) => v !== from.x[i] && v !== to.x[i],
    )
    expect(moved.length).toBeGreaterThan(0)
  })
})
