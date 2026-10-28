import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Reveal } from './Reveal.tsx'
import { scrollToTarget } from './smoothScroll.ts'

vi.mock('./smoothScroll.ts', () => ({
  onScroll: vi.fn(() => () => undefined),
  scrollToTarget: vi.fn(),
}))

let reduce = false
vi.mock('./reducedMotion.ts', () => ({
  prefersReducedMotion: () => reduce,
}))

function renderReveal() {
  return render(
    <Reveal>
      <section>sobre</section>
      <section>
        <a href="https://github.com/">GitHub</a>
      </section>
    </Reveal>,
  )
}

const root = (container: HTMLElement) =>
  container.firstElementChild as HTMLElement

afterEach(() => {
  reduce = false
  vi.mocked(scrollToTarget).mockClear()
})

describe('Reveal', () => {
  it('com reduced motion só renderiza os filhos', () => {
    reduce = true
    const { container } = renderReveal()
    expect(screen.getByText('sobre')).toBeInTheDocument()
    expect(root(container)).not.toHaveAttribute('data-reveal')
    expect(root(container).style.getPropertyValue('--reveal-curve')).toBe('')
  })

  it('com o Contato cabendo na janela, liga a revelação', () => {
    const { container } = renderReveal()
    expect(root(container)).toHaveAttribute('data-reveal')
    expect(root(container).style.getPropertyValue('--reveal-curve')).not.toBe(
      '',
    )
  })

  it('Contato mais alto que a janela: não fica preso, sem curva nem sombra', () => {
    const height = vi
      .spyOn(HTMLElement.prototype, 'offsetHeight', 'get')
      .mockReturnValue(5000)
    const { container } = renderReveal()
    height.mockRestore()
    expect(root(container)).not.toHaveAttribute('data-reveal')
    expect(root(container)).not.toHaveAttribute('data-reveal-shade')
    expect(
      Number(root(container).style.getPropertyValue('--reveal-curve')),
    ).toBe(0)
  })

  // O caso do teclado depende de layout real e de :focus-visible: está em
  // e2e/reveal.spec.ts.
  it('foco que não é de teclado (clique) não mexe no scroll', () => {
    renderReveal()
    fireEvent.focusIn(screen.getByRole('link', { name: 'GitHub' }))
    expect(scrollToTarget).not.toHaveBeenCalled()
  })
})
