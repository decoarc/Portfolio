import { fireEvent, render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { scrollToTarget } from '@/motion/smoothScroll.ts'
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
        path: '*',
        element: (
          <>
            <ScrollManager />
            <a href="#work">Work</a>
            <a href="/work/atlas">Atlas</a>
            <section id="work">work</section>
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
})

describe('ScrollManager', () => {
  it('clique em link de hash não deixa o navegador saltar e rola uma vez só', () => {
    const router = renderAt('/')
    const link = screen.getByRole('link', { name: 'Work' })
    const allowed = fireEvent.click(link)
    expect(allowed).toBe(false)
    expect(router.state.location.hash).toBe('#work')
    expect(scrollToTarget).toHaveBeenCalledTimes(1)
    expect(scrollToTarget).toHaveBeenCalledWith(screen.getByText('work'))
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
})
