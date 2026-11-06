import { useEffect, useRef, useState, type PointerEvent } from 'react'
import { useLocation } from 'react-router'
import {
  documentTop,
  glideToY,
  onScroll,
  scrollToTarget,
  scrollToY,
} from '../../motion/smoothScroll.ts'
import { currentMark, railMetrics, scrollForPoint } from './scrollRail.ts'
import styles from './ScrollRail.module.css'

/** Classe no <html> que esconde a barra nativa enquanto o trilho existe. */
const HTML_CLASS = 'has-scroll-rail'
/** Quanto o trilho fica aceso depois do último movimento. */
const IDLE_MS = 1100
/** Altura da linha de leitura, em fração da janela. */
const READING_LINE = 0.4

interface Mark {
  /** Fração do trilho onde a seção começa (0–1). */
  at: number
  /** Topo da seção no documento, em px. */
  top: number
  label: string
  target: HTMLElement
}

/**
 * Barra de rolagem do site: um filete na margem direita, com uma marca por
 * seção numerada (a mesma numeração do índice) e um marcador de tinta que
 * arrasta. Decorativa para leitores de tela — teclado e roda continuam
 * rolando a página nativamente. Só com ponteiro fino; no toque fica a nativa.
 */
export function ScrollRail() {
  const { pathname } = useLocation()
  const [mounted, setMounted] = useState(false)
  const [marks, setMarks] = useState<Mark[]>([])
  const railRef = useRef<HTMLDivElement>(null)
  const labelRef = useRef<HTMLSpanElement>(null)
  const marksRef = useRef<Mark[]>([])
  const drag = useRef<{ pointerY: number; scrollY: number } | null>(null)
  const paintRef = useRef<() => void>(() => undefined)

  useEffect(() => {
    setMounted(true)
    const html = document.documentElement
    html.classList.add(HTML_CLASS)
    return () => html.classList.remove(HTML_CLASS)
  }, [])

  useEffect(() => {
    const rail = railRef.current
    if (!rail) return
    let idle = 0

    const paint = () => {
      const doc = document.documentElement
      const { size, offset } = railMetrics(
        window.scrollY,
        doc.scrollHeight,
        window.innerHeight,
      )
      rail.style.setProperty('--rail-size', String(size))
      rail.style.setProperty('--rail-offset', String(offset))
      rail.dataset.scrollable = String(size < 1)

      const list = marksRef.current
      // A seção da vez é a que cruza a linha de leitura, não o topo da janela.
      const index = currentMark(
        window.scrollY + window.innerHeight * READING_LINE,
        list.map((mark) => mark.top),
      )
      for (const node of rail.querySelectorAll<HTMLElement>('[data-index]'))
        node.dataset.passed = String(Number(node.dataset.index) <= index)
      if (labelRef.current)
        labelRef.current.textContent = index >= 0 ? list[index].label : ''
    }

    const measure = () => {
      const doc = document.documentElement
      const height = doc.scrollHeight
      const sections = Array.from(
        document.querySelectorAll<HTMLElement>('main section[id]'),
      )
      const next = sections.map((target, i) => {
        const top = documentTop(target)
        return {
          at: Math.min(1, top / height),
          top,
          label: String(i + 1).padStart(2, '0'),
          target,
        }
      })
      marksRef.current = next
      setMarks(next)
      paint()
    }

    const wake = () => {
      rail.dataset.active = 'true'
      window.clearTimeout(idle)
      idle = window.setTimeout(() => {
        if (!drag.current) rail.dataset.active = 'false'
      }, IDLE_MS)
    }

    paintRef.current = paint
    measure()
    const stop = onScroll(() => {
      paint()
      wake()
    })
    // A altura muda sem a janela mudar (fontes, imagens, rota nova).
    const observer =
      typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(measure)
    observer?.observe(document.body)
    window.addEventListener('resize', measure)
    return () => {
      stop()
      observer?.disconnect()
      window.removeEventListener('resize', measure)
      window.clearTimeout(idle)
    }
  }, [mounted, pathname])

  // As marcas novas só existem no DOM depois de renderizadas: pinta de novo.
  useEffect(() => paintRef.current(), [marks])

  if (!mounted) return null

  const maxScroll = () =>
    document.documentElement.scrollHeight - window.innerHeight

  const onTrackDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return
    const rail = railRef.current
    if (!rail) return
    const box = rail.getBoundingClientRect()
    const fraction = (event.clientY - box.top) / box.height
    const size = Number(rail.style.getPropertyValue('--rail-size')) || 1
    glideToY(
      scrollForPoint(
        fraction,
        size,
        document.documentElement.scrollHeight,
        window.innerHeight,
      ),
    )
  }

  const onThumbDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return
    event.stopPropagation()
    event.preventDefault()
    event.currentTarget.setPointerCapture(event.pointerId)
    drag.current = { pointerY: event.clientY, scrollY: window.scrollY }
    railRef.current?.setAttribute('data-dragging', 'true')
  }

  const onThumbMove = (event: PointerEvent<HTMLDivElement>) => {
    const start = drag.current
    const rail = railRef.current
    if (!start || !rail) return
    const size = Number(rail.style.getPropertyValue('--rail-size')) || 1
    if (size >= 1) return
    const travel = rail.getBoundingClientRect().height * (1 - size)
    const delta = ((event.clientY - start.pointerY) / travel) * maxScroll()
    scrollToY(Math.round(start.scrollY + delta))
  }

  const onThumbUp = (event: PointerEvent<HTMLDivElement>) => {
    if (!drag.current) return
    drag.current = null
    event.currentTarget.releasePointerCapture(event.pointerId)
    railRef.current?.removeAttribute('data-dragging')
  }

  return (
    <div
      ref={railRef}
      className={styles.rail}
      data-scroll-rail=""
      aria-hidden="true"
      data-active="false"
      onPointerDown={onTrackDown}
    >
      <div className={styles.line} data-motion="rail-line" />
      {marks.map((mark, i) => (
        <div
          key={mark.label}
          className={styles.mark}
          data-motion="rail-mark"
          style={{ top: `${mark.at * 100}%` }}
          data-index={i}
          onPointerDown={(event) => {
            if (event.button !== 0) return
            event.stopPropagation()
            scrollToTarget(mark.target)
          }}
        >
          <span className={styles.markLabel} data-motion="rail-label">
            {mark.label}
          </span>
        </div>
      ))}
      <div
        className={styles.thumb}
        data-motion="rail-thumb"
        onPointerDown={onThumbDown}
        onPointerMove={onThumbMove}
        onPointerUp={onThumbUp}
        onPointerCancel={onThumbUp}
      >
        <span
          ref={labelRef}
          className={styles.thumbLabel}
          data-motion="rail-label"
        />
      </div>
    </div>
  )
}
