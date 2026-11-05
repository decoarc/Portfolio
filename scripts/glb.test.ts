import { describe, expect, it } from 'vitest'
import { encodeCloud, readTriangles, samplePointCloud } from './glb.ts'

/** Monta um `.glb` mínimo com um triângulo por nó, como um exportador faria. */
function makeGlb(
  positions: number[],
  node: Record<string, unknown> = {},
  extra: Record<string, unknown> = {},
): Uint8Array {
  const bin = new Uint8Array(new Float32Array(positions).buffer)
  const json = {
    asset: { version: '2.0' },
    scene: 0,
    scenes: [{ nodes: [0] }],
    nodes: [{ mesh: 0, ...node }],
    meshes: [{ primitives: [{ attributes: { POSITION: 0 } }] }],
    accessors: [
      {
        bufferView: 0,
        componentType: 5126,
        count: positions.length / 3,
        type: 'VEC3',
      },
    ],
    bufferViews: [{ buffer: 0, byteOffset: 0, byteLength: bin.byteLength }],
    buffers: [{ byteLength: bin.byteLength }],
    ...extra,
  }
  let text = JSON.stringify(json)
  while (text.length % 4) text += ' '
  const jsonBytes = new TextEncoder().encode(text)
  const total = 12 + 8 + jsonBytes.length + 8 + bin.byteLength
  const out = new Uint8Array(total)
  const view = new DataView(out.buffer)
  view.setUint32(0, 0x46546c67, true)
  view.setUint32(4, 2, true)
  view.setUint32(8, total, true)
  view.setUint32(12, jsonBytes.length, true)
  view.setUint32(16, 0x4e4f534a, true)
  out.set(jsonBytes, 20)
  const at = 20 + jsonBytes.length
  view.setUint32(at, bin.byteLength, true)
  view.setUint32(at + 4, 0x004e4942, true)
  out.set(bin, at + 8)
  return out
}

const triangle = [0, 0, 0, 1, 0, 0, 0, 1, 0]

describe('readTriangles', () => {
  it('lê os vértices do triângulo', () => {
    expect(Array.from(readTriangles(makeGlb(triangle)))).toEqual(triangle)
  })

  it('aplica a escala e a translação do nó', () => {
    const t = readTriangles(
      makeGlb(triangle, { scale: [2, 2, 2], translation: [0, 10, 0] }),
    )
    expect(Array.from(t)).toEqual([0, 10, 0, 2, 10, 0, 0, 12, 0])
  })

  it('aplica a rotação do nó (90° em z leva x para y)', () => {
    const s = Math.SQRT1_2
    const t = readTriangles(makeGlb(triangle, { rotation: [0, 0, s, s] }))
    expect(t[3]).toBeCloseTo(0)
    expect(t[4]).toBeCloseTo(1)
  })

  it('recusa modelos que exigem extensão (compressão)', () => {
    expect(() =>
      readTriangles(
        makeGlb(
          triangle,
          {},
          { extensionsRequired: ['KHR_draco_mesh_compression'] },
        ),
      ),
    ).toThrow(/Draco/)
  })

  it('recusa o que não é .glb', () => {
    expect(() => readTriangles(new Uint8Array(32))).toThrow(/glTF/)
  })
})

describe('samplePointCloud', () => {
  // Dois triângulos: um grande em y = 0 e um minúsculo em y = 5.
  const tris = Float32Array.from([
    0, 0, 0, 10, 0, 0, 0, 0, 10, 0, 5, 0, 0.01, 5, 0, 0, 5, 0.01,
  ])

  it('cabe em [-1, 1] e encosta na borda no eixo mais longo', () => {
    const p = samplePointCloud(tris, 500)
    const abs = Array.from(p, Math.abs)
    expect(Math.max(...abs)).toBeLessThanOrEqual(1 + 1e-6)
    expect(Math.max(...abs)).toBeGreaterThan(0.9)
  })

  it('distribui pela área: quase tudo cai no triângulo grande', () => {
    const p = samplePointCloud(tris, 500)
    // O triângulo grande é plano: os pontos dele dividem o mesmo y.
    const counts = new Map<number, number>()
    for (let i = 0; i < 500; i++) {
      const y = Math.round(p[i * 3 + 1]! * 1000)
      counts.set(y, (counts.get(y) ?? 0) + 1)
    }
    expect(Math.max(...counts.values())).toBeGreaterThan(495)
  })

  it('é determinística', () => {
    expect(samplePointCloud(tris, 50)).toEqual(samplePointCloud(tris, 50))
  })

  it('codifica em 6 bytes por ponto', () => {
    expect(encodeCloud(samplePointCloud(tris, 10)).byteLength).toBe(60)
  })
})
