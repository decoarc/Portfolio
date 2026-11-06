import { renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  STAMP_LIFETIME_MS,
  isEditableTarget,
  typewriterAction,
  useTypewriter,
} from './typewriter.ts'

const play = vi.fn()
vi.mock('./typewriterSound.ts', () => ({ createClack: () => play }))

function key(init: KeyboardEventInit & { key: string }) {
  return new KeyboardEvent('keydown', { bubbles: true, ...init })
}

describe('typewriterAction', () => {
  it('letras, números, pontuação e acentos carimbam', () => {
    for (const k of ['a', 'Z', '7', '?', 'á', 'ç', '@']) {
      expect(typewriterAction(key({ key: k }))).toEqual({
        kind: 'stamp',
        char: k,
      })
    }
  })

  it('espaço só toca o clack', () => {
    expect(typewriterAction(key({ key: ' ' }))).toEqual({ kind: 'clack' })
  })

  it('teclas de navegação e de função ficam de fora', () => {
    for (const k of [
      'Enter',
      'Tab',
      'Escape',
      'ArrowDown',
      'F5',
      'Shift',
      'Dead',
      'Backspace',
    ]) {
      expect(typewriterAction(key({ key: k }))).toBeNull()
    }
  })

  it('atalhos com Ctrl, Alt ou Cmd não carimbam', () => {
    expect(typewriterAction(key({ key: 'f', ctrlKey: true }))).toBeNull()
    expect(typewriterAction(key({ key: 'c', metaKey: true }))).toBeNull()
    expect(typewriterAction(key({ key: 'x', altKey: true }))).toBeNull()
  })

  it('AltGr (Ctrl+Alt no Windows) ainda carimba o caractere', () => {
    const event = key({ key: '@', ctrlKey: true, altKey: true })
    Object.defineProperty(event, 'getModifierState', {
      value: (k: string) => k === 'AltGraph',
    })
    expect(typewriterAction(event)).toEqual({ kind: 'stamp', char: '@' })
  })

  it('tecla segurada (repeat) não carimba de novo', () => {
    expect(typewriterAction(key({ key: 'a', repeat: true }))).toBeNull()
  })
})

describe('isEditableTarget', () => {
  it('campos de texto e contenteditable contam como editáveis', () => {
    const input = document.createElement('input')
    const textarea = document.createElement('textarea')
    const select = document.createElement('select')
    const editable = document.createElement('div')
    editable.contentEditable = 'true'
    Object.defineProperty(editable, 'isContentEditable', { value: true })
    for (const el of [input, textarea, select, editable]) {
      expect(isEditableTarget(el)).toBe(true)
    }
  })

  it('links, botões e o body não são editáveis', () => {
    expect(isEditableTarget(document.createElement('a'))).toBe(false)
    expect(isEditableTarget(document.createElement('button'))).toBe(false)
    expect(isEditableTarget(document.body)).toBe(false)
    expect(isEditableTarget(null)).toBe(false)
  })
})

function setMouseDevice(fine: boolean) {
  vi.spyOn(window, 'matchMedia').mockImplementation(
    (query: string) =>
      ({
        matches: query.includes('pointer: fine') ? fine : false,
        media: query,
        addEventListener: () => undefined,
        removeEventListener: () => undefined,
      }) as unknown as MediaQueryList,
  )
}

function mouseMove(x: number, y: number) {
  const event = new MouseEvent('pointermove', { clientX: x, clientY: y })
  Object.defineProperty(event, 'pointerType', { value: 'mouse' })
  window.dispatchEvent(event)
}

const stamps = () =>
  document.querySelectorAll<HTMLElement>('[data-typewriter-stamp]')

describe('useTypewriter', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    play.mockClear()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
    document.body.innerHTML = ''
  })

  it('carimba a letra na ponta do mouse e toca o clack', () => {
    setMouseDevice(true)
    renderHook(() => useTypewriter())
    mouseMove(300, 200)
    document.body.dispatchEvent(key({ key: 'o' }))

    const [stamp] = stamps()
    expect(stamp).toHaveTextContent('o')
    expect(stamp.style.left).toBe('300px')
    expect(stamp.style.top).toBe('200px')
    expect(play).toHaveBeenCalledTimes(1)
  })

  it('mouse parado: as letras se empilham no mesmo ponto', () => {
    setMouseDevice(true)
    renderHook(() => useTypewriter())
    mouseMove(120, 80)
    for (const k of ['o', 'l', 'á'])
      document.body.dispatchEvent(key({ key: k }))

    const all = [...stamps()]
    expect(all).toHaveLength(3)
    expect(new Set(all.map((s) => `${s.style.left},${s.style.top}`)).size).toBe(
      1,
    )
  })

  it('a letra some depois do fade', () => {
    setMouseDevice(true)
    renderHook(() => useTypewriter())
    document.body.dispatchEvent(key({ key: 'a' }))
    expect(stamps()).toHaveLength(1)
    vi.advanceTimersByTime(STAMP_LIFETIME_MS + 50)
    expect(stamps()).toHaveLength(0)
  })

  it('espaço toca o clack sem carimbar', () => {
    setMouseDevice(true)
    renderHook(() => useTypewriter())
    document.body.dispatchEvent(key({ key: ' ' }))
    expect(stamps()).toHaveLength(0)
    expect(play).toHaveBeenCalledTimes(1)
  })

  it('digitando num campo de texto não faz nada', () => {
    setMouseDevice(true)
    renderHook(() => useTypewriter())
    const input = document.createElement('input')
    document.body.append(input)
    input.dispatchEvent(key({ key: 'a' }))
    expect(stamps()).toHaveLength(0)
    expect(play).not.toHaveBeenCalled()
  })

  it('sem mouse (celular, tablet) fica desligado', () => {
    setMouseDevice(false)
    renderHook(() => useTypewriter())
    document.body.dispatchEvent(key({ key: 'a' }))
    expect(stamps()).toHaveLength(0)
    expect(play).not.toHaveBeenCalled()
  })

  it('ao desmontar, para de escutar e limpa as letras', () => {
    setMouseDevice(true)
    const { unmount } = renderHook(() => useTypewriter())
    document.body.dispatchEvent(key({ key: 'a' }))
    unmount()
    expect(stamps()).toHaveLength(0)
    document.body.dispatchEvent(key({ key: 'b' }))
    expect(stamps()).toHaveLength(0)
  })
})
