import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { StrictMode } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Opening } from './Opening.tsx'
import { onScroll, scrollToTop } from './smoothScroll.ts'

vi.mock('./smoothScroll.ts', () => ({
  onScroll: vi.fn(() => () => undefined),
  scrollToTop: vi.fn(),
}))

let reduce = false
vi.mock('./reducedMotion.ts', () => ({
  prefersReducedMotion: () => reduce,
}))

function setWindow(scrollY: number, width = 1440, height = 900) {
  Object.defineProperty(window, 'scrollY', {
    configurable: true,
    value: scrollY,
  })
  Object.defineProperty(window, 'innerWidth', {
    configurable: true,
    value: width,
  })
  Object.defineProperty(window, 'innerHeight', {
    configurable: true,
    value: height,
  })
}

function renderOpening() {
  return render(
    <Opening>
      <section>
        <a href="#contact">Get in touch</a>
      </section>
      <section>índice</section>
    </Opening>,
  )
}

const root = (container: HTMLElement) =>
  container.firstElementChild as HTMLElement

afterEach(() => {
  reduce = false
  delete document.documentElement.dataset.entranceEarly
  setWindow(0)
  vi.mocked(scrollToTop).mockClear()
})

describe('Opening', () => {
  it('com reduced motion só renderiza os filhos', () => {
    reduce = true
    const { container } = renderOpening()
    expect(screen.getByText('índice')).toBeInTheDocument()
    expect(root(container)).not.toHaveAttribute('data-entrance')
    expect(root(container).style.getPropertyValue('--opening-drift')).toBe('')
  })

  it('no topo, o nome começa escondido e a entrada roda', async () => {
    setWindow(0)
    const { container } = renderOpening()
    expect(root(container)).toHaveAttribute('data-entrance', 'pending')
    await waitFor(() =>
      expect(root(container)).toHaveAttribute('data-entrance', 'run'),
    )
  })

  it('aberta já rolada: sem entrada, valores da posição atual', () => {
    setWindow(900, 1440, 900)
    const { container } = renderOpening()
    expect(root(container)).not.toHaveAttribute('data-entrance')
    expect(
      Number(root(container).style.getPropertyValue('--opening-drift')),
    ).toBe(25)
    expect(
      Number(root(container).style.getPropertyValue('--opening-curve')),
    ).toBe(0)
    expect(root(container)).toHaveAttribute('data-shade')
  })

  it('se o navegador restaura a posição antes da entrada, ela não roda', async () => {
    setWindow(0)
    const { container } = renderOpening()
    expect(root(container)).toHaveAttribute('data-entrance', 'pending')
    setWindow(300)
    await waitFor(() =>
      expect(root(container)).not.toHaveAttribute('data-entrance'),
    )
  })

  it('deep link com hash: sem entrada, mesmo antes de rolar', () => {
    setWindow(0)
    window.history.replaceState(null, '', '/#work')
    const { container } = renderOpening()
    window.history.replaceState(null, '', '/')
    expect(root(container)).not.toHaveAttribute('data-entrance')
  })

  it('no celular o afastamento é de 40 vw', () => {
    setWindow(900, 390, 900)
    const { container } = renderOpening()
    expect(
      Number(root(container).style.getPropertyValue('--opening-drift')),
    ).toBe(40)
  })

  it('com a folha no topo, rolar mais não reescreve os valores', () => {
    setWindow(900, 1440, 900)
    const { container } = renderOpening()
    const listener = vi.mocked(onScroll).mock.calls.at(-1)![0]
    const spy = vi.spyOn(root(container).style, 'setProperty')
    setWindow(1800, 1440, 900)
    listener()
    expect(spy).not.toHaveBeenCalled()
    setWindow(450, 1440, 900)
    listener()
    expect(spy).toHaveBeenCalled()
  })

  it('no topo não há sombra', () => {
    setWindow(0)
    const { container } = renderOpening()
    expect(root(container)).not.toHaveAttribute('data-shade')
  })

  // O caso do teclado depende de layout real e de :focus-visible: está em
  // e2e/opening.spec.ts (Shift+Tab, tela baixa).
  it('foco que não é de teclado (clique) não mexe no scroll', () => {
    setWindow(900)
    renderOpening()
    fireEvent.focusIn(screen.getByRole('link', { name: 'Get in touch' }))
    expect(scrollToTop).not.toHaveBeenCalled()
  })

  describe('marca do script inline (data-entrance-early)', () => {
    const html = document.documentElement

    it('expired: sem entrada, e a marca sai do <html>', async () => {
      setWindow(0)
      html.dataset.entranceEarly = 'expired'
      const { container } = renderOpening()
      expect(html).not.toHaveAttribute('data-entrance-early')
      expect(root(container)).not.toHaveAttribute('data-entrance')
      await new Promise((resolve) => setTimeout(resolve, 50))
      expect(root(container)).not.toHaveAttribute('data-entrance')
    })

    it('pending: o Opening assume (pending) e a marca sai do <html>', () => {
      setWindow(0)
      html.dataset.entranceEarly = 'pending'
      const { container } = renderOpening()
      expect(html).not.toHaveAttribute('data-entrance-early')
      expect(root(container)).toHaveAttribute('data-entrance', 'pending')
    })

    it('com reduced motion a marca também sai', () => {
      reduce = true
      html.dataset.entranceEarly = 'pending'
      const { container } = renderOpening()
      expect(html).not.toHaveAttribute('data-entrance-early')
      expect(root(container)).not.toHaveAttribute('data-entrance')
    })

    it('expired sobrevive ao efeito duplo do StrictMode', () => {
      setWindow(0)
      html.dataset.entranceEarly = 'expired'
      const { container } = render(
        <StrictMode>
          <Opening>
            <section>hero</section>
            <section>índice</section>
          </Opening>
        </StrictMode>,
      )
      expect(root(container)).not.toHaveAttribute('data-entrance')
    })
  })

  it('foco no índice não mexe no scroll', () => {
    setWindow(900)
    renderOpening()
    fireEvent.focusIn(screen.getByText('índice'))
    expect(scrollToTop).not.toHaveBeenCalled()
  })
})
