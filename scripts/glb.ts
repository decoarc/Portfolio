/**
 * Leitura mínima de `.glb` (glTF 2.0 binário) para o cubo de partículas do
 * Hero: só as posições dos triângulos, já com as transformações dos nós. Sem
 * dependências; recusa com mensagem clara o que não sabe ler (compressão
 * Draco/meshopt, posições quantizadas).
 */

interface GltfAccessor {
  bufferView?: number
  byteOffset?: number
  componentType: number
  count: number
  type: string
  normalized?: boolean
}

interface GltfBufferView {
  buffer: number
  byteOffset?: number
  byteLength: number
  byteStride?: number
}

interface GltfPrimitive {
  attributes: Record<string, number>
  indices?: number
  mode?: number
}

interface GltfNode {
  mesh?: number
  children?: number[]
  matrix?: number[]
  translation?: number[]
  rotation?: number[]
  scale?: number[]
}

interface Gltf {
  extensionsRequired?: string[]
  accessors?: GltfAccessor[]
  bufferViews?: GltfBufferView[]
  meshes?: { primitives: GltfPrimitive[] }[]
  nodes?: GltfNode[]
  scenes?: { nodes?: number[] }[]
  scene?: number
}

/** Triângulos soltos: a cada 9 números, os três vértices de um triângulo. */
export type Triangles = Float32Array

const FLOAT = 5126
const TRIANGLES = 4
const CHUNK_JSON = 0x4e4f534a
const CHUNK_BIN = 0x004e4942

const INDEX_READERS: Record<number, (view: DataView, at: number) => number> = {
  5121: (v, at) => v.getUint8(at),
  5123: (v, at) => v.getUint16(at, true),
  5125: (v, at) => v.getUint32(at, true),
}
const INDEX_SIZE: Record<number, number> = { 5121: 1, 5123: 2, 5125: 4 }

type Mat4 = Float64Array

function identity(): Mat4 {
  const m = new Float64Array(16)
  m[0] = m[5] = m[10] = m[15] = 1
  return m
}

/** `a × b`, em ordem de colunas (como o glTF). */
function multiply(a: Mat4, b: Mat4): Mat4 {
  const out = new Float64Array(16)
  for (let c = 0; c < 4; c++)
    for (let r = 0; r < 4; r++) {
      let sum = 0
      for (let k = 0; k < 4; k++) sum += a[k * 4 + r]! * b[c * 4 + k]!
      out[c * 4 + r] = sum
    }
  return out
}

/** Matriz local de um nó: `matrix`, ou translação × rotação × escala. */
export function nodeMatrix(node: GltfNode): Mat4 {
  if (node.matrix) return Float64Array.from(node.matrix)
  const [tx, ty, tz] = node.translation ?? [0, 0, 0]
  const [qx, qy, qz, qw] = node.rotation ?? [0, 0, 0, 1]
  const [sx, sy, sz] = node.scale ?? [1, 1, 1]
  const x = qx!,
    y = qy!,
    z = qz!,
    w = qw!
  return Float64Array.from([
    (1 - 2 * (y * y + z * z)) * sx!,
    2 * (x * y + z * w) * sx!,
    2 * (x * z - y * w) * sx!,
    0,
    2 * (x * y - z * w) * sy!,
    (1 - 2 * (x * x + z * z)) * sy!,
    2 * (y * z + x * w) * sy!,
    0,
    2 * (x * z + y * w) * sz!,
    2 * (y * z - x * w) * sz!,
    (1 - 2 * (x * x + y * y)) * sz!,
    0,
    tx!,
    ty!,
    tz!,
    1,
  ])
}

function fail(message: string): never {
  throw new Error(`glb: ${message}`)
}

/** Separa o JSON e o bloco binário de um `.glb`. */
export function parseGlb(data: Uint8Array): { json: Gltf; bin: DataView } {
  const view = new DataView(data.buffer, data.byteOffset, data.byteLength)
  if (data.byteLength < 20 || view.getUint32(0, true) !== 0x46546c67)
    fail('não é um arquivo .glb (falta o cabeçalho "glTF")')
  if (view.getUint32(4, true) !== 2) fail('só glTF 2.0 é suportado')
  let json: Gltf | null = null
  let bin: DataView | null = null
  let at = 12
  while (at + 8 <= data.byteLength) {
    const length = view.getUint32(at, true)
    const type = view.getUint32(at + 4, true)
    const start = at + 8
    if (type === CHUNK_JSON)
      json = JSON.parse(
        new TextDecoder().decode(data.subarray(start, start + length)),
      ) as Gltf
    else if (type === CHUNK_BIN)
      bin = new DataView(data.buffer, data.byteOffset + start, length)
    at = start + length
  }
  if (!json) fail('sem o bloco JSON')
  if (!bin) fail('sem o bloco binário (buffers externos não são suportados)')
  return { json, bin }
}

/**
 * Todos os triângulos da cena, em coordenadas do mundo (com as matrizes dos
 * nós aplicadas). Só primitivas de triângulos; pontos e linhas ficam de fora.
 */
export function readTriangles(data: Uint8Array): Triangles {
  const { json, bin } = parseGlb(data)
  const required = json.extensionsRequired ?? []
  if (required.length)
    fail(
      `o modelo exige ${required.join(', ')} (provavelmente compressão). ` +
        'Exporte de novo sem compressão Draco/meshopt.',
    )

  const accessor = (index: number) => {
    const a = json.accessors?.[index] ?? fail(`accessor ${index} não existe`)
    if (a.bufferView === undefined)
      fail('accessors sem bufferView não são suportados')
    const bv =
      json.bufferViews?.[a.bufferView] ??
      fail(`bufferView ${a.bufferView} não existe`)
    if (bv.buffer !== 0) fail('só o buffer do próprio .glb é suportado')
    return { a, offset: (bv.byteOffset ?? 0) + (a.byteOffset ?? 0), bv }
  }

  const out: number[] = []
  const emit = (primitive: GltfPrimitive, world: Mat4) => {
    if ((primitive.mode ?? TRIANGLES) !== TRIANGLES) return
    const posIndex = primitive.attributes.POSITION
    if (posIndex === undefined) return
    const pos = accessor(posIndex)
    if (pos.a.componentType !== FLOAT || pos.a.type !== 'VEC3')
      fail('posições precisam ser VEC3 float (sem quantização)')
    const stride = pos.bv.byteStride ?? 12
    const vertex = (i: number, target: number[]) => {
      const at = pos.offset + i * stride
      const x = bin.getFloat32(at, true)
      const y = bin.getFloat32(at + 4, true)
      const z = bin.getFloat32(at + 8, true)
      target.push(
        world[0]! * x + world[4]! * y + world[8]! * z + world[12]!,
        world[1]! * x + world[5]! * y + world[9]! * z + world[13]!,
        world[2]! * x + world[6]! * y + world[10]! * z + world[14]!,
      )
    }
    if (primitive.indices === undefined) {
      const count = pos.a.count - (pos.a.count % 3)
      for (let i = 0; i < count; i++) vertex(i, out)
      return
    }
    const idx = accessor(primitive.indices)
    const read =
      INDEX_READERS[idx.a.componentType] ?? fail('tipo de índice inválido')
    const size = INDEX_SIZE[idx.a.componentType]!
    const count = idx.a.count - (idx.a.count % 3)
    for (let i = 0; i < count; i++)
      vertex(read(bin, idx.offset + i * size), out)
  }

  const visit = (index: number, parent: Mat4, depth: number) => {
    if (depth > 64) fail('hierarquia de nós profunda demais (ciclo?)')
    const node = json.nodes?.[index] ?? fail(`nó ${index} não existe`)
    const world = multiply(parent, nodeMatrix(node))
    if (node.mesh !== undefined) {
      const mesh =
        json.meshes?.[node.mesh] ?? fail(`malha ${node.mesh} não existe`)
      for (const primitive of mesh.primitives) emit(primitive, world)
    }
    for (const child of node.children ?? []) visit(child, world, depth + 1)
  }

  const scene = json.scenes?.[json.scene ?? 0]
  const roots =
    scene?.nodes ??
    // Sem cena: todos os nós que não são filhos de ninguém.
    (json.nodes ?? [])
      .map((_, i) => i)
      .filter((i) => !(json.nodes ?? []).some((n) => n.children?.includes(i)))
  for (const root of roots) visit(root, identity(), 0)
  if (!out.length) fail('nenhum triângulo encontrado')
  return Float32Array.from(out)
}

/**
 * `count` pontos espalhados por igual sobre a superfície (cada triângulo
 * recebe pontos na proporção da sua área), centrados e escalados para caber no
 * cubo de -1 a 1 como o cubo do Hero. Os eixos saem no sistema do canvas: o
 * glTF tem y para cima e a frente em +z; aqui y cresce para baixo e +z se
 * afasta da câmera, então os dois se invertem (um giro de 180° em x). A ordem
 * é aleatória: qualquer prefixo da nuvem é uma amostra uniforme.
 */
export function samplePointCloud(
  triangles: Triangles,
  count: number,
  seed = 1,
): Float32Array {
  const tris = Math.floor(triangles.length / 9)
  const cumulative = new Float64Array(tris)
  let total = 0
  for (let t = 0; t < tris; t++) {
    const o = t * 9
    const ux = triangles[o + 3]! - triangles[o]!
    const uy = triangles[o + 4]! - triangles[o + 1]!
    const uz = triangles[o + 5]! - triangles[o + 2]!
    const vx = triangles[o + 6]! - triangles[o]!
    const vy = triangles[o + 7]! - triangles[o + 1]!
    const vz = triangles[o + 8]! - triangles[o + 2]!
    const cx = uy * vz - uz * vy
    const cy = uz * vx - ux * vz
    const cz = ux * vy - uy * vx
    total += Math.sqrt(cx * cx + cy * cy + cz * cz) / 2
    cumulative[t] = total
  }
  if (total <= 0) fail('a malha não tem área')

  let s = seed
  const rand = () => {
    s = (s * 16807) % 2147483647
    return s / 2147483647
  }
  const points = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    // Busca binária do triângulo sorteado pela área acumulada.
    const pick = rand() * total
    let lo = 0
    let hi = tris - 1
    while (lo < hi) {
      const mid = (lo + hi) >> 1
      if (cumulative[mid]! < pick) lo = mid + 1
      else hi = mid
    }
    let a = rand()
    let b = rand()
    if (a + b > 1) {
      a = 1 - a
      b = 1 - b
    }
    const o = lo * 9
    for (let k = 0; k < 3; k++) {
      const p0 = triangles[o + k]!
      points[i * 3 + k] =
        p0 + (triangles[o + 3 + k]! - p0) * a + (triangles[o + 6 + k]! - p0) * b
    }
  }

  // Centro da caixa e maior meia extensão: o modelo cabe em [-1, 1]³.
  const min = [Infinity, Infinity, Infinity]
  const max = [-Infinity, -Infinity, -Infinity]
  for (let i = 0; i < count; i++)
    for (let k = 0; k < 3; k++) {
      const v = points[i * 3 + k]!
      if (v < min[k]!) min[k] = v
      if (v > max[k]!) max[k] = v
    }
  const center = min.map((v, k) => (v + max[k]!) / 2)
  const half = Math.max(...max.map((v, k) => (v - min[k]!) / 2)) || 1
  const flip = [1, -1, -1]
  for (let i = 0; i < count; i++)
    for (let k = 0; k < 3; k++)
      points[i * 3 + k] = ((points[i * 3 + k]! - center[k]!) / half) * flip[k]!
  return points
}

/** Nuvem em Int16 (x, y, z intercalados, de -32767 a 32767): ~6 bytes/ponto. */
export function encodeCloud(points: Float32Array): Uint8Array {
  const out = new Int16Array(points.length)
  for (let i = 0; i < points.length; i++)
    out[i] = Math.round(Math.max(-1, Math.min(1, points[i]!)) * 32767)
  return new Uint8Array(out.buffer)
}
