/**
 * Campo de pontos: as partículas que desenham o "AA" do Contato. Aqui fica só
 * a parte pura (amostragem da silhueta e um passo da física), testável sem
 * canvas; o desenho e os eventos ficam em `DotField.tsx`.
 */

export interface Particles {
  /** Posição de repouso (na silhueta), em px CSS. */
  homeX: Float32Array
  homeY: Float32Array
  x: Float32Array
  y: Float32Array
  vx: Float32Array
  vy: Float32Array
  /** Fase própria de cada ponto: a respiração não anda em bloco. */
  phase: Float32Array
  count: number
}

export interface Pointer {
  x: number
  y: number
  /** Velocidade do cursor, em px por frame (60 Hz). */
  vx: number
  vy: number
  /** 0 fora do campo, 1 presente; sobe e desce suave. */
  presence: number
}

export const FIELD = {
  /** Raio de influência do cursor, em px. */
  radius: 80,
  /** Empurrão radial máximo, em px/frame². */
  push: 1.4,
  /** Quanto da velocidade do cursor arrasta os pontos próximos. */
  drag: 0.16,
  /** Mola de volta à silhueta. */
  spring: 0.02,
  /** Atrito por frame. */
  damping: 0.72,
  /** Amplitude da respiração em repouso, em px. */
  breathe: 0.8,
} as const

/**
 * Amostra a silhueta numa grade: `alpha` é o canal alfa de um raster `w×h`,
 * e cada célula `step×step` com tinta vira um ponto, com um leve jitter
 * determinístico para a grade não aparecer.
 */
export function sampleSilhouette(
  alpha: ArrayLike<number>,
  w: number,
  h: number,
  step: number,
): { x: number[]; y: number[] } {
  const xs: number[] = []
  const ys: number[] = []
  let seed = 1
  const rand = () => {
    seed = (seed * 16807) % 2147483647
    return seed / 2147483647
  }
  for (let y = 0; y < h; y += step) {
    for (let x = 0; x < w; x += step) {
      const a = alpha[(Math.floor(y) * w + Math.floor(x)) | 0] ?? 0
      if (a < 40) continue
      xs.push(x + (rand() - 0.5) * step * 0.6)
      ys.push(y + (rand() - 0.5) * step * 0.6)
    }
  }
  return { x: xs, y: ys }
}

export function createParticles(home: { x: number[]; y: number[] }): Particles {
  const count = home.x.length
  const p: Particles = {
    homeX: Float32Array.from(home.x),
    homeY: Float32Array.from(home.y),
    x: Float32Array.from(home.x),
    y: Float32Array.from(home.y),
    vx: new Float32Array(count),
    vy: new Float32Array(count),
    phase: new Float32Array(count),
    count,
  }
  for (let i = 0; i < count; i++) {
    p.phase[i] = (((i * 2654435761) % 1000) / 1000) * Math.PI * 2
  }
  return p
}

/**
 * Um passo de física (`dt` em frames de 60 Hz). Cada ponto: mola até a casa,
 * empurrão radial do cursor que cai com o quadrado da distância, arrasto na
 * direção em que o cursor anda e atrito. Devolve a energia cinética total, que
 * diz quando o campo assentou e o laço pode dormir.
 */
export function stepParticles(
  p: Particles,
  pointer: Pointer,
  time: number,
  dt = 1,
): number {
  const { radius, push, drag, spring, damping, breathe } = FIELD
  const r2 = radius * radius
  const damp = Math.pow(damping, dt)
  let energy = 0
  for (let i = 0; i < p.count; i++) {
    const ph = p.phase[i]!
    const tx = p.homeX[i]! + Math.sin(time * 0.0011 + ph) * breathe
    const ty = p.homeY[i]! + Math.cos(time * 0.0013 + ph * 1.7) * breathe
    let ax = (tx - p.x[i]!) * spring
    let ay = (ty - p.y[i]!) * spring

    if (pointer.presence > 0) {
      const dx = p.x[i]! - pointer.x
      const dy = p.y[i]! - pointer.y
      const d2 = dx * dx + dy * dy
      if (d2 < r2) {
        const d = Math.sqrt(d2) || 0.001
        const falloff = 1 - d / radius
        const f = falloff * falloff * pointer.presence
        // Leve giro tangencial: o ponto escorrega ao redor do cursor em vez
        // de só fugir em linha reta.
        ax += ((dx / d) * push + (-dy / d) * push * 0.35) * f
        ay += ((dy / d) * push + (dx / d) * push * 0.35) * f
        ax += pointer.vx * drag * f
        ay += pointer.vy * drag * f
      }
    }

    const vx = (p.vx[i]! + ax * dt) * damp
    const vy = (p.vy[i]! + ay * dt) * damp
    p.vx[i] = vx
    p.vy[i] = vy
    p.x[i] = p.x[i]! + vx * dt
    p.y[i] = p.y[i]! + vy * dt
    energy += vx * vx + vy * vy
  }
  return energy
}

/**
 * Troca as casas por outras (a forma se moveu, como o cubo que gira) e leva
 * cada ponto junto pelo mesmo deslocamento. Assim a mola só vê o que o cursor
 * desarrumou: sem isso, os pontos correriam atrás da casa e a forma borraria.
 */
export function moveHomes(
  p: Particles,
  homeX: ArrayLike<number>,
  homeY: ArrayLike<number>,
): void {
  for (let i = 0; i < p.count; i++) {
    const nx = homeX[i]!
    const ny = homeY[i]!
    p.x[i] = p.x[i]! + nx - p.homeX[i]!
    p.y[i] = p.y[i]! + ny - p.homeY[i]!
    p.homeX[i] = nx
    p.homeY[i] = ny
  }
}
