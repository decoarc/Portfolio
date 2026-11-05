import { useEffect, useRef } from 'react'
import {
  MORPH_MS,
  applyScatter,
  blendLattice,
  createScatter,
  cubeLattice,
  projectLattice,
  type Lattice,
  type Scatter,
} from './cube.ts'
import {
  createParticles,
  moveHomes,
  stepParticles,
  type Particles,
} from './dotField.ts'
import { fitCloud, loadClouds } from './pointClouds.ts'
import { trackPointer, type PointerTracker } from './pointerField.ts'

interface CubeFieldProps {
  /** Classe do canvas (que passa da célula para os pontos espalhados). */
  className?: string
  /** Classe do botão que cobre a célula do cubo. */
  buttonClassName?: string
  /** Rótulo do botão para leitores de tela. */
  label: string
}

/** Raio de cada ponto, em px CSS. */
const DOT = 1
/** Velocidade (px/frame) a partir da qual o ponto acende no acento. */
const HOT = 1.4
/** Distância entre pontos vizinhos na face, em px CSS (aproximada). */
const SPACING = 9
/** Uma volta completa, em ms. */
const TURN = 18000
/** Inclinação fixa (~18°): com a perspectiva, a face de cima aparece só um pouco. */
const PITCH = 0.32
/** Opacidade por faixa de profundidade, do fundo para a frente. */
const LAYERS = [0.16, 0.32, 0.6, 1] as const
/**
 * Escala dos modelos em relação ao cubo: com a maior medida igual à aresta do
 * cubo, uma figura alta e estreita parece pequena ao lado dele.
 */
const MODEL_SCALE = 1.45
/** Quanto se rola até o cubo se desfazer de todo, em alturas da janela. */
const SCATTER_SPAN = 0.7

function cssVar(el: Element, name: string, fallback: string) {
  return getComputedStyle(el).getPropertyValue(name).trim() || fallback
}

/**
 * Um cubo de pontos girando em torno do eixo vertical. Os pontos de trás
 * apagam; o cursor empurra e arrasta os pontos como no `DotField`, mas não
 * mexe no giro, que é sempre constante. Rolando a página para baixo, o cubo se
 * desfaz em pontos soltos; voltando ao Hero, ele se refaz (o avanço segue o
 * scroll, então é reversível por construção). Quem apaga os pontos é o CSS do
 * Hero, com o mesmo `--opening-fade` do nome: os dois somem juntos.
 *
 * Um clique (ou Enter/Espaço no botão) troca a forma: os pontos voam do cubo
 * para o primeiro modelo de `public/models/` (gerados por `pnpm models`), e
 * assim por diante, até voltar ao cubo. As nuvens só são baixadas quando o
 * cursor ou o foco chega ao botão.
 *
 * O canvas é `aria-hidden` e não recebe eventos; quem recebe é o botão sobre a
 * célula. Com reduced motion, um quadro parado, e a troca de forma é
 * instantânea. O laço só roda com o canvas na tela.
 */
export function CubeField({
  className,
  buttonClassName,
  label,
}: CubeFieldProps) {
  const ref = useRef<HTMLCanvasElement>(null)
  // Ligam o botão (JSX) ao estado do efeito.
  const nextShape = useRef<() => void>(() => {})
  const preload = useRef<() => void>(() => {})

  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas?.getContext('2d')
    if (
      !canvas ||
      !ctx ||
      typeof ResizeObserver === 'undefined' ||
      typeof IntersectionObserver === 'undefined'
    )
      return
    const reduced =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    /** O cubo, para o tamanho atual. */
    let cube: Lattice | null = null
    /** Modelos baixados (na escala da nuvem) e o que está em andamento. */
    let clouds: Lattice[] | null = null
    let loading: Promise<Lattice[]> | null = null
    /** 0 é o cubo; 1… são os modelos, na ordem do manifesto. */
    let shapeIndex = 0
    /** As formas com o mesmo número de pontos do cubo, ponto a ponto. */
    let shapes: Lattice[] = []
    /** O que é projetado: a forma atual, ou a mistura durante a troca. */
    let lattice: Lattice | null = null
    let morph: { from: Lattice; to: Lattice; start: number } | null = null
    let scatter: Scatter | null = null
    /** Topo do canvas no documento: a referência do avanço do scroll. */
    let docTop = 0
    let progress = 0
    let particles: Particles | null = null
    let homeX = new Float32Array(0)
    let homeY = new Float32Array(0)
    let depth = new Float32Array(0)
    let width = 0
    let height = 0
    /**
     * A célula do grid onde o cubo mora. O canvas passa dela (CSS), para os
     * pontos espalhados terem espaço; o cubo se mede e se centra pela célula.
     */
    let cell = { cx: 0, cy: 0, min: 0 }
    let ink = '#16130f'
    let accent = '#a32114'
    let yaw = 0.6
    let frame = 0
    let visible = false
    let last = 0
    let tracker: PointerTracker | null = null

    const view = () => ({
      yaw,
      pitch: PITCH,
      size: cell.min * 0.27,
      cx: cell.cx,
      cy: cell.cy,
    })

    /** 0 com o Hero no lugar, 1 depois de rolar o bastante para baixo. */
    const readProgress = () => {
      const top = canvas.getBoundingClientRect().top
      const span = window.innerHeight * SCATTER_SPAN
      return span > 0 ? Math.min(1, Math.max(0, (docTop - top) / span)) : 0
    }

    /** Casas do frame: o cubo girado e projetado, depois espalhado. */
    const project = () => {
      if (!lattice || !scatter) return
      const v = view()
      projectLattice(lattice, v, homeX, homeY, depth)
      applyScatter(homeX, homeY, scatter, progress, v)
    }

    /** Refaz `shapes` para o número de pontos do cubo atual. */
    const fitShapes = () => {
      if (!cube) return
      const count = cube.count
      shapes = [
        cube,
        ...(clouds ?? []).map((c) => fitCloud(c, count, MODEL_SCALE)),
      ]
      if (shapeIndex >= shapes.length) shapeIndex = 0
    }

    const ensureClouds = () => {
      loading ??= loadClouds(import.meta.env.BASE_URL)
        .catch(() => [] as Lattice[])
        .then((loaded) => {
          clouds = loaded
          fitShapes()
          return loaded
        })
      return loading
    }

    /** Uma cópia do que está na tela, para a troca partir dali. */
    const snapshot = (l: Lattice): Lattice => ({
      x: l.x.slice(),
      y: l.y.slice(),
      z: l.z.slice(),
      count: l.count,
    })

    const goNext = async () => {
      await ensureClouds()
      if (!cube || !lattice || !particles || shapes.length < 2) return
      shapeIndex = (shapeIndex + 1) % shapes.length
      const to = shapes[shapeIndex]!
      if (reduced) {
        morph = null
        lattice = to
        project()
        moveHomes(particles, homeX, homeY)
        draw()
        return
      }
      morph = { from: snapshot(lattice), to, start: performance.now() }
      lattice = snapshot(lattice)
      start()
    }
    nextShape.current = () => void goNext()
    preload.current = () => void ensureClouds()

    const build = () => {
      const rect = canvas.getBoundingClientRect()
      width = Math.round(rect.width)
      height = Math.round(rect.height)
      docTop = rect.top + window.scrollY
      const box = canvas.parentElement?.getBoundingClientRect() ?? rect
      cell = {
        cx: box.left - rect.left + box.width / 2,
        cy: box.top - rect.top + box.height / 2,
        min: Math.min(box.width, box.height),
      }
      if (width < 40 || height < 40 || cell.min < 40) {
        particles = null
        return
      }
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = width * dpr
      canvas.height = height * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ink = cssVar(canvas, '--ink', ink)
      accent = cssVar(canvas, '--accent', accent)

      const edge = cell.min * 0.54
      const n = Math.max(8, Math.min(26, Math.round(edge / SPACING) + 1))
      cube = cubeLattice(n)
      fitShapes()
      // Mudou o tamanho no meio de uma troca: pula para a forma de destino.
      morph = null
      lattice = shapes[shapeIndex] ?? cube
      homeX = new Float32Array(cube.count)
      homeY = new Float32Array(cube.count)
      depth = new Float32Array(cube.count)
      scatter = createScatter(cube.count)
      progress = reduced ? 0 : readProgress()
      project()
      particles = createParticles({
        x: Array.from(homeX),
        y: Array.from(homeY),
      })
      draw()
    }

    const draw = () => {
      if (!particles) return
      ctx.clearRect(0, 0, width, height)
      const { x, y, vx, vy, count } = particles
      const hot2 = HOT * HOT
      const size = DOT * 2
      // Faixas de profundidade × (calmo, rápido). Quadrados em vez de arcos,
      // como no `DotField`: no tamanho do ponto não se distinguem.
      for (let layer = 0; layer < LAYERS.length; layer++) {
        ctx.globalAlpha = LAYERS[layer]!
        for (const pass of [0, 1]) {
          ctx.fillStyle = pass === 0 ? ink : accent
          for (let i = 0; i < count; i++) {
            const band = Math.min(
              LAYERS.length - 1,
              Math.floor(depth[i]! * LAYERS.length),
            )
            if (band !== layer) continue
            const fast = vx[i]! * vx[i]! + vy[i]! * vy[i]! > hot2
            if (fast !== (pass === 1)) continue
            ctx.fillRect(x[i]! - DOT, y[i]! - DOT, size, size)
          }
        }
      }
      ctx.globalAlpha = 1
    }

    const tick = (now: number) => {
      frame = 0
      if (!visible || !particles || !lattice || !tracker) return
      const dt = last ? Math.min((now - last) / (1000 / 60), 3) : 1
      last = now
      tracker.ease(dt)
      if (morph) {
        const t = Math.min(1, (now - morph.start) / MORPH_MS)
        blendLattice(morph.from, morph.to, t, lattice)
        if (t >= 1) {
          lattice = morph.to
          morph = null
        }
      }
      yaw = (yaw + ((Math.PI * 2) / TURN) * (1000 / 60) * dt) % (Math.PI * 2)
      progress = readProgress()
      project()
      moveHomes(particles, homeX, homeY)
      stepParticles(particles, tracker.pointer, now, dt)
      draw()
      frame = requestAnimationFrame(tick)
    }

    const start = () => {
      if (reduced || frame || !visible) return
      last = 0
      frame = requestAnimationFrame(tick)
    }

    const io = new IntersectionObserver(([entry]) => {
      visible = !!entry?.isIntersecting
      if (visible) start()
    })
    io.observe(canvas)

    let resizeTimer = 0
    const ro = new ResizeObserver(() => {
      window.clearTimeout(resizeTimer)
      resizeTimer = window.setTimeout(build, 120)
    })
    ro.observe(canvas)

    if (!reduced) tracker = trackPointer(canvas, start)
    build()

    return () => {
      cancelAnimationFrame(frame)
      window.clearTimeout(resizeTimer)
      io.disconnect()
      ro.disconnect()
      tracker?.dispose()
    }
  }, [])

  return (
    <>
      <canvas ref={ref} className={className} aria-hidden="true" />
      <button
        type="button"
        className={buttonClassName}
        aria-label={label}
        onClick={() => nextShape.current()}
        onPointerEnter={() => preload.current()}
        onFocus={() => preload.current()}
      />
    </>
  )
}
