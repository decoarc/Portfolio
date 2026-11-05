import { useEffect, useRef } from 'react'
import {
  createParticles,
  sampleSilhouette,
  stepParticles,
  type Particles,
} from './dotField.ts'
import { trackPointer, type PointerTracker } from './pointerField.ts'

interface DotFieldProps {
  /** O texto que os pontos desenham. */
  text: string
  className?: string
}

/** Lado da célula de amostragem, em px CSS: menor = mais pontos. */
const STEP = 3.4
/** Raio de cada ponto, em px CSS. */
const DOT = 1
/** Velocidade (px/frame) a partir da qual o ponto acende no acento. */
const HOT = 1.4

function cssVar(el: Element, name: string, fallback: string) {
  return getComputedStyle(el).getPropertyValue(name).trim() || fallback
}

/**
 * Silhueta de `text` feita de milhares de pontos que se afastam do cursor,
 * são arrastados pelo movimento dele e voltam por mola. Decorativo: o canvas
 * é `aria-hidden`, não recebe eventos e, com reduced motion, desenha os
 * pontos parados uma vez só. O laço dorme fora da tela.
 */
export function DotField({ text, className }: DotFieldProps) {
  const ref = useRef<HTMLCanvasElement>(null)

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

    let particles: Particles | null = null
    let width = 0
    let height = 0
    let ink = '#16130f'
    let accent = '#a32114'
    let frame = 0
    let visible = false
    let last = 0
    let disposed = false
    let tracker: PointerTracker | null = null

    const build = async () => {
      const rect = canvas.getBoundingClientRect()
      width = Math.round(rect.width)
      height = Math.round(rect.height)
      if (width < 40 || height < 40) {
        particles = null
        return
      }
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = width * dpr
      canvas.height = height * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ink = cssVar(canvas, '--ink', ink)
      accent = cssVar(canvas, '--accent', accent)

      const family = cssVar(canvas, '--font-display', 'Georgia, serif')
      const weight = 640
      try {
        await document.fonts?.load(`${weight} 100px ${family}`, text)
      } catch {
        // Sem a fonte, a silhueta sai no fallback: ainda é "AA".
      }
      if (disposed) return

      // Raster da silhueta no tamanho do canvas, em px CSS.
      const off = document.createElement('canvas')
      off.width = width
      off.height = height
      const octx = off.getContext('2d', { willReadFrequently: true })
      if (!octx) return
      let size = height * 0.86
      octx.font = `${weight} ${size}px ${family}`
      const measured = octx.measureText(text).width
      if (measured > width * 0.94) size *= (width * 0.94) / measured
      octx.font = `${weight} ${size}px ${family}`
      octx.textAlign = 'center'
      octx.textBaseline = 'alphabetic'
      const m = octx.measureText(text)
      const glyphH = m.actualBoundingBoxAscent + m.actualBoundingBoxDescent
      const baseline = (height - glyphH) / 2 + m.actualBoundingBoxAscent
      octx.fillStyle = '#000'
      octx.fillText(text, width / 2, baseline)
      const data = octx.getImageData(0, 0, width, height).data
      const alpha = new Uint8ClampedArray(width * height)
      for (let i = 0; i < alpha.length; i++) alpha[i] = data[i * 4 + 3]!
      particles = createParticles(sampleSilhouette(alpha, width, height, STEP))
      draw()
    }

    const draw = () => {
      if (!particles) return
      ctx.clearRect(0, 0, width, height)
      const { x, y, vx, vy, count } = particles
      const hot2 = HOT * HOT
      // Quadrados de 2px, não arcos: no tamanho do ponto não se distinguem, e
      // `fillRect` custa ~4x menos (medido: 6000 pontos, ~3ms contra ~14ms).
      // Dois passes: os calmos em tinta, os rápidos no acento.
      const size = DOT * 2
      for (const pass of [0, 1]) {
        ctx.fillStyle = pass === 0 ? ink : accent
        for (let i = 0; i < count; i++) {
          const fast = vx[i]! * vx[i]! + vy[i]! * vy[i]! > hot2
          if (fast !== (pass === 1)) continue
          ctx.fillRect(x[i]! - DOT, y[i]! - DOT, size, size)
        }
      }
    }

    const tick = (now: number) => {
      frame = 0
      if (!visible || !particles || !tracker) return
      const dt = last ? Math.min((now - last) / (1000 / 60), 3) : 1
      last = now
      tracker.ease(dt)
      const energy = stepParticles(particles, tracker.pointer, now, dt)
      draw()
      // Assentou e o cursor foi embora: o laço dorme até ele voltar.
      if (
        tracker.target === 0 &&
        tracker.pointer.presence < 0.01 &&
        energy / particles.count < 0.002
      )
        return
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
      resizeTimer = window.setTimeout(() => void build(), 120)
    })
    ro.observe(canvas)

    if (!reduced) tracker = trackPointer(canvas, start)
    void build()

    return () => {
      disposed = true
      cancelAnimationFrame(frame)
      window.clearTimeout(resizeTimer)
      io.disconnect()
      ro.disconnect()
      tracker?.dispose()
    }
  }, [text])

  return <canvas ref={ref} className={className} aria-hidden="true" />
}
