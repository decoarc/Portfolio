import { act, fireEvent, render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { scrollToTarget, scrollToTop } from '@/motion/smoothScroll.ts'
import { INSTANT_SCROLL } from './navigationState.ts'
import { ScrollManager } from './ScrollManager.tsx'

vi.mock('@/motion/smoothScroll.ts', () => ({
  refreshSmoothScroll: vi.fn(),
  scrollToTarget: vi.fn(),
  scrollToTop: vi.fn(),
}))

function renderAt(url: string) {
  const router = createMemoryRouter(
    [
      {
        path: '/work/:slug',
        element: (
          <>
            <ScrollManager />
            <main id="main" tabIndex={-1}>
              <h1 tabIndex={-1} data-route-focus>
                Case
              </h1>
            </main>
          </>
        ),
      },
      {
        path: '*',
        element: (
          <>
            <ScrollManager />
            <main id="main" tabIndex={-1}>
              <a href="#work">Work</a>
              <a href="/work/atlas">Atlas</a>
              <section id="work">work</section>
              <ol>
                <li id="work-atlas">
                  <a href="/work/atlas" data-anchor-focus>
                    Atlas title
                  </a>
                </li>
                <li id="work-bravo">
                  <a href="/work/bravo" data-anchor-focus>
                    Bravo title
                  </a>
                </li>
              </ol>
            </main>
          </>
        ),
      },
    ],
    { initialEntries: [url] },
  )
  render(<RouterProvider router={router} />)
  return router
}

afterEach(() => {
  vi.mocked(scrollToTarget).mockClear()
  vi.mocked(scrollToTop).mockClear()
})

describe('ScrollManager', () => {
  it('clique em link de hash não deixa o navegador saltar e rola uma vez só', () => {
    const router = renderAt('/')
    const link = screen.getByRole('link', { name: 'Work' })
    const allowed = fireEvent.click(link)
    expect(allowed).toBe(false)
    expect(router.state.location.hash).toBe('#work')
    expect(scrollToTarget).toHaveBeenCalledTimes(1)
    expect(scrollToTarget).toHaveBeenCalledWith(screen.getByText('work'), {
      immediate: false,
    })
  })

  it('clicar de novo no mesmo hash rola de novo', () => {
    renderAt('/#work')
    vi.mocked(scrollToTarget).mockClear()
    fireEvent.click(screen.getByRole('link', { name: 'Work' }))
    expect(scrollToTarget).toHaveBeenCalledTimes(1)
  })

  it('clique com modificador fica com o navegador', () => {
    renderAt('/')
    const allowed = fireEvent.click(
      screen.getByRole('link', { name: 'Work' }),
      {
        ctrlKey: true,
      },
    )
    expect(allowed).toBe(true)
    expect(scrollToTarget).not.toHaveBeenCalled()
  })

  it('link para outra rota não é interceptado', () => {
    const router = renderAt('/')
    fireEvent.click(screen.getByRole('link', { name: 'Atlas' }))
    expect(router.state.location.pathname).toBe('/')
  })

  it('âncora com data-anchor-focus: foca o elemento marcado, não o alvo', async () => {
    const router = renderAt('/')
    await act(() => router.navigate({ pathname: '/', hash: '#work-atlas' }))
    expect(document.activeElement).toBe(
      screen.getByRole('link', { name: 'Atlas title' }),
    )
  })

  it('alvo com vários data-anchor-focus (um contêiner) recebe o foco ele mesmo', async () => {
    const router = renderAt('/')
    await act(() => router.navigate({ pathname: '/', hash: '#main' }))
    expect(document.activeElement?.id).toBe('main')
  })

  it('estado INSTANT_SCROLL rola imediato', async () => {
    const router = renderAt('/')
    await act(() =>
      router.navigate(
        { pathname: '/', hash: '#work-atlas' },
        { state: INSTANT_SCROLL },
      ),
    )
    expect(scrollToTarget).toHaveBeenCalledWith(
      document.getElementById('work-atlas'),
      { immediate: true },
    )
  })

  it('hash sem estado rola com deslize', async () => {
    const router = renderAt('/')
    await act(() => router.navigate({ pathname: '/', hash: '#work-atlas' }))
    expect(scrollToTarget).toHaveBeenCalledWith(
      document.getElementById('work-atlas'),
      { immediate: false },
    )
  })

  it('PUSH sem hash foca data-route-focus quando existe', async () => {
    const router = renderAt('/')
    await act(() => router.navigate('/work/atlas'))
    expect(document.activeElement).toBe(
      screen.getByRole('heading', { level: 1, name: 'Case' }),
    )
    expect(scrollToTop).toHaveBeenCalled()
  })

  it('POP foca #main e não rola', async () => {
    const router = renderAt('/')
    await act(() => router.navigate('/work/atlas'))
    vi.mocked(scrollToTop).mockClear()
    await act(() => router.navigate(-1))
    expect(document.activeElement?.id).toBe('main')
    expect(scrollToTop).not.toHaveBeenCalled()
  })
})
