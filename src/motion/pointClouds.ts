import type { Lattice } from './cube.ts'

/**
 * As nuvens de pontos dos modelos do cubo do Hero, geradas por `pnpm models`
 * (scripts/models.ts) em `public/models/`: Int16 com x, y, z intercalados,
 * de -32767 a 32767, já centradas e no sistema de eixos do canvas.
 */

export interface CloudManifest {
  points: number
  models: string[]
}

export function decodeCloud(buffer: ArrayBuffer): Lattice {
  const raw = new Int16Array(buffer)
  const count = Math.floor(raw.length / 3)
  const l: Lattice = {
    x: new Float32Array(count),
    y: new Float32Array(count),
    z: new Float32Array(count),
    count,
  }
  for (let i = 0; i < count; i++) {
    l.x[i] = raw[i * 3]! / 32767
    l.y[i] = raw[i * 3 + 1]! / 32767
    l.z[i] = raw[i * 3 + 2]! / 32767
  }
  return l
}

/**
 * A nuvem com exatamente `count` pontos, para casar ponto a ponto com o cubo:
 * pega o começo (a ordem já é aleatória, então o começo é uma amostra
 * uniforme) e, se faltar, repete do início. `scale` aumenta o modelo: ele
 * vem na mesma caixa do cubo, mas uma figura estreita ocupa bem menos tela.
 */
export function fitCloud(cloud: Lattice, count: number, scale = 1): Lattice {
  const l: Lattice = {
    x: new Float32Array(count),
    y: new Float32Array(count),
    z: new Float32Array(count),
    count,
  }
  if (!cloud.count) return l
  for (let i = 0; i < count; i++) {
    const j = i % cloud.count
    l.x[i] = cloud.x[j]! * scale
    l.y[i] = cloud.y[j]! * scale
    l.z[i] = cloud.z[j]! * scale
  }
  return l
}

/** Baixa o manifesto e todas as nuvens, na ordem dos cliques. */
export async function loadClouds(base: string): Promise<Lattice[]> {
  const dir = `${base.replace(/\/?$/, '/')}models/`
  const response = await fetch(`${dir}manifest.json`)
  if (!response.ok) return []
  const manifest = (await response.json()) as CloudManifest
  return Promise.all(
    manifest.models.map(async (name) => {
      const bin = await fetch(`${dir}${name}`)
      if (!bin.ok) throw new Error(`nuvem ${name}: HTTP ${bin.status}`)
      return decodeCloud(await bin.arrayBuffer())
    }),
  )
}
