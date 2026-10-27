import { render, screen } from '@testing-library/react'
import { renderToString } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { onScroll } from '../../motion/smoothScroll.ts'
import { LitText } from './LitText.tsx'

const stop = vi.fn()
vi.mock('../../motion/smoothScroll.ts', () => ({
  onScroll: vi.fn(() => stop),
}))

let reduce = false
vi.mock('../../motion/reducedMotion.ts', () => ({
  prefersReducedMotion: () => reduce,
}))

const TEXT = 'Sou desenvolvedor full stack, no Brasil.'
const WORDS = TEXT.split(/\s+/)

const words = (container: HTMLElement) => [
  ...container.querySelectorAll<HTMLElement>('[aria-hidden="true"] span'),
]

afterEach(() => {
  reduce = false
  vi.mocked(onScroll).mockClear()
  stop.mockClear()
})

describe('LitText', () => {
  it('o primeiro render é o texto simples, aceso', () => {
    const html = renderToString(<LitText text={TEXT} className="lead" />)
    expect(html).toBe(`<p class="lead">${TEXT}</p>`)
  })

  it('depois de montar, quebra em palavras escondidas do leitor de tela', () => {
    const { container } = render(<LitText text={TEXT} />)
    expect(container.querySelector('p')).toHaveAttribute('data-lit')
    expect(words(container).map((w) => w.textContent)).toEqual(WORDS)
    expect(
      words(container).map((w) => w.style.getPropertyValue('--i')),
    ).toEqual(WORDS.map((_, i) => String(i)))
    expect(screen.getByText(TEXT)).toHaveClass('visually-hidden')
  })

  it('assina o scroll e escreve --lit na montagem', () => {
    const { container } = render(<LitText text={TEXT} />)
    expect(onScroll).toHaveBeenCalledTimes(1)
    expect(
      container.querySelector('p')!.style.getPropertyValue('--lit'),
    ).not.toBe('')
  })

  it('com reduced motion não quebra nem assina', () => {
    reduce = true
    const { container } = render(<LitText text={TEXT} />)
    const p = container.querySelector('p')!
    expect(p).not.toHaveAttribute('data-lit')
    expect(p.innerHTML).toBe(TEXT)
    expect(onScroll).not.toHaveBeenCalled()
  })

  it('trocar o texto refaz as palavras', () => {
    const { container, rerender } = render(<LitText text={TEXT} />)
    const other = 'I am a full stack developer.'
    rerender(<LitText text={other} />)
    expect(words(container).map((w) => w.textContent)).toEqual(
      other.split(/\s+/),
    )
    expect(screen.getByText(other)).toHaveClass('visually-hidden')
    expect(screen.queryByText(TEXT)).toBeNull()
  })

  it('desmontar cancela a assinatura', () => {
    const { unmount } = render(<LitText text={TEXT} />)
    unmount()
    expect(stop).toHaveBeenCalled()
  })
})
