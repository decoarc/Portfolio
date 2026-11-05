/**
 * O cubo de pontos do Hero: a grade nas seis faces e a projeção de cada frame.
 * Parte pura, sem canvas; o desenho fica em `CubeField.tsx`.
 */

export interface Lattice {
  /** Coordenadas no cubo unitário, de -1 a 1. */
  x: Float32Array
  y: Float32Array
  z: Float32Array
  count: number
}

/**
 * `n × n` pontos em cada uma das seis faces. As arestas saem com o dobro de
 * pontos (duas faces passam por ali), o que já desenha o contorno do cubo.
 */
export function cubeLattice(n: number): Lattice {
  const xs: number[] = []
  const ys: number[] = []
  const zs: number[] = []
  const at = (i: number) => (n === 1 ? 0 : (i / (n - 1)) * 2 - 1)
  for (const axis of [0, 1, 2]) {
    for (const side of [-1, 1]) {
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
          const v = [at(i), at(j)]
          v.splice(axis, 0, side)
          xs.push(v[0]!)
          ys.push(v[1]!)
          zs.push(v[2]!)
        }
      }
    }
  }
  return {
    x: Float32Array.from(xs),
    y: Float32Array.from(ys),
    z: Float32Array.from(zs),
    count: xs.length,
  }
}

export interface View {
  /** Giro em torno do eixo vertical, em rad. */
  yaw: number
  /** Inclinação em torno do eixo horizontal, em rad: mostra a face de cima. */
  pitch: number
  /** Meia aresta na tela, em px. */
  size: number
  cx: number
  cy: number
}

/** Distância da câmera, em meias arestas: menor = perspectiva mais forte. */
const CAMERA = 8

/**
 * Gira e projeta a grade com perspectiva. `depth` vai de 0 (fundo) a 1
 * (frente), para o desenho apagar os pontos de trás.
 */
export function projectLattice(
  l: Lattice,
  view: View,
  outX: Float32Array,
  outY: Float32Array,
  depth: Float32Array,
): void {
  const cy = Math.cos(view.yaw)
  const sy = Math.sin(view.yaw)
  const cp = Math.cos(view.pitch)
  const sp = Math.sin(view.pitch)
  // Meia diagonal do cubo: o alcance de z depois de qualquer giro.
  const reach = Math.sqrt(3)
  for (let i = 0; i < l.count; i++) {
    const x0 = l.x[i]!
    const y0 = l.y[i]!
    const z0 = l.z[i]!
    // Yaw (eixo y), depois pitch (eixo x).
    const x1 = x0 * cy + z0 * sy
    const z1 = -x0 * sy + z0 * cy
    const y2 = y0 * cp - z1 * sp
    const z2 = y0 * sp + z1 * cp
    const scale = CAMERA / (CAMERA + z2)
    outX[i] = view.cx + x1 * scale * view.size
    outY[i] = view.cy + y2 * scale * view.size
    depth[i] = (reach - z2) / (2 * reach)
  }
}

export interface Scatter {
  /** Direção e alcance do desvio de cada ponto, em frações do raio. */
  dx: Float32Array
  dy: Float32Array
  /** Quanto cada ponto espera antes de sair, de 0 a 1: a forma desfia aos poucos. */
  delay: Float32Array
}

/** Sorteia (de forma determinística) para onde cada ponto vai ao se espalhar. */
export function createScatter(count: number): Scatter {
  const s: Scatter = {
    dx: new Float32Array(count),
    dy: new Float32Array(count),
    delay: new Float32Array(count),
  }
  let seed = 7
  const rand = () => {
    seed = (seed * 16807) % 2147483647
    return seed / 2147483647
  }
  for (let i = 0; i < count; i++) {
    const angle = rand() * Math.PI * 2
    const reach = 0.3 + rand() * 0.7
    s.dx[i] = Math.cos(angle) * reach
    s.dy[i] = Math.sin(angle) * reach
    s.delay[i] = rand()
  }
  return s
}

/**
 * Quanto do avanço total cabe na espera de cada ponto. Pequeno: o estouro é
 * coletivo, e a espera só tira a cara de bloco rígido.
 */
const STAGGER = 0.08
/** Raio no fim do estouro, em frações do raio do cubo. */
const BLAST = 2.4
/** Alcance do desvio sorteado no estouro, em meias arestas. */
const DRIFT = 1.4

/** Avanço de um ponto (0 no lugar, 1 no fim do estouro), já com a espera. */
export function scatterAmount(progress: number, delay: number): number {
  return Math.min(1, Math.max(0, (progress - delay * STAGGER) / (1 - STAGGER)))
}

/**
 * O estouro, para um avanço `e`: o raio salta de 1 até `BLAST`, rápido no
 * começo e freando no fim. `burst` diz quanto do estouro já aconteceu, de 0 a 1.
 */
export function explosion(e: number): { radial: number; burst: number } {
  const burst = 1 - (1 - e) ** 3
  return { radial: 1 + (BLAST - 1) * burst, burst }
}

/**
 * Desloca as casas projetadas conforme o avanço do scroll (`progress`, de 0 a
 * 1): o cubo estoura para fora, e cada ponto ainda desvia na sua direção
 * sorteada. Com `progress` 0 nada muda, e voltar o
 * scroll refaz o cubo pelo mesmo caminho.
 */
export function applyScatter(
  homeX: Float32Array,
  homeY: Float32Array,
  s: Scatter,
  progress: number,
  view: Pick<View, 'cx' | 'cy' | 'size'>,
): void {
  if (progress <= 0) return
  for (let i = 0; i < homeX.length; i++) {
    const e = scatterAmount(progress, s.delay[i]!)
    if (e === 0) continue
    const { radial, burst } = explosion(e)
    const drift = view.size * DRIFT * burst
    homeX[i] = view.cx + (homeX[i]! - view.cx) * radial + s.dx[i]! * drift
    homeY[i] = view.cy + (homeY[i]! - view.cy) * radial + s.dy[i]! * drift
  }
}

/** Duração da troca de forma, em ms. */
export const MORPH_MS = 1100
/** Quanto do tempo da troca cabe na espera de cada ponto: chegam em onda. */
const MORPH_STAGGER = 0.35
/** Quanto a forma incha no meio da troca, em frações do raio. */
const MORPH_SWELL = 0.35

/**
 * Um quadro da troca de forma: cada ponto `i` vai da posição em `from` à
 * posição em `to`, com sua própria espera (pelo índice) e uma curva que
 * acelera e freia. No meio do caminho a nuvem incha um pouco, para os pontos
 * passarem por fora em vez de atravessarem o centro. `t` de 0 a 1.
 */
export function blendLattice(
  from: Lattice,
  to: Lattice,
  t: number,
  out: Lattice,
): void {
  for (let i = 0; i < out.count; i++) {
    const delay = (((i * 2654435761) >>> 0) % 1000) / 1000
    const local = Math.min(
      1,
      Math.max(0, (t - delay * MORPH_STAGGER) / (1 - MORPH_STAGGER)),
    )
    const e = local < 0.5 ? 4 * local ** 3 : 1 - (-2 * local + 2) ** 3 / 2
    const swell = 1 + MORPH_SWELL * Math.sin(Math.PI * local)
    out.x[i] = (from.x[i]! + (to.x[i]! - from.x[i]!) * e) * swell
    out.y[i] = (from.y[i]! + (to.y[i]! - from.y[i]!) * e) * swell
    out.z[i] = (from.z[i]! + (to.z[i]! - from.z[i]!) * e) * swell
  }
}
