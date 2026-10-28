import { act, render, screen, within } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { beforeEach, describe, expect, it } from 'vitest'
import { createRoutes } from './routes.tsx'

function renderAt(url: string) {
  const router = createMemoryRouter(createRoutes(), { initialEntries: [url] })
  return render(<RouterProvider router={router} />)
}

describe('rotas por locale', () => {
  it('/ em inglês, com título da home', async () => {
    renderAt('/')
    await screen.findByRole('banner')
    expect(document.documentElement.lang).toBe('en')
    expect(document.title).toBe('André Arcodaci — Full Stack Developer')
  })

  it.each(['/pt', '/pt/'])('%s em português', async (url) => {
    renderAt(url)
    await screen.findByRole('banner')
    expect(document.documentElement.lang).toBe('pt-BR')
  })

  it('404 em inglês para rota desconhecida', async () => {
    renderAt('/rota/qualquer')
    expect(
      await screen.findByRole('heading', { name: 'Page not found' }),
    ).toBeInTheDocument()
  })

  it('404 em português sob /pt', async () => {
    renderAt('/pt/qualquer')
    expect(
      await screen.findByRole('heading', { name: 'Página não encontrada' }),
    ).toBeInTheDocument()
    expect(document.documentElement.lang).toBe('pt-BR')
  })

  it('case study inexistente cai na 404', async () => {
    renderAt('/work/nao-existe')
    expect(
      await screen.findByRole('heading', { name: 'Page not found' }),
    ).toBeInTheDocument()
  })

  it('o link de idioma preserva o caminho', async () => {
    renderAt('/work/nao-existe')
    const link = await screen.findByRole('link', { name: 'Português' })
    expect(link).toHaveAttribute('href', '/pt/work/nao-existe')
    expect(link).toHaveAttribute('hreflang', 'pt-BR')
    expect(link).toHaveAttribute('lang', 'pt-BR')
  })

  it('o primeiro link é o skip link para #main', async () => {
    renderAt('/')
    await screen.findByRole('banner')
    const first = screen.getAllByRole('link')[0]
    expect(first).toHaveAttribute('href', '#main')
    expect(first).toHaveTextContent('Skip to content')
  })

  it('/ tem um só h1 e os h2 na ordem do índice', async () => {
    renderAt('/')
    await screen.findByRole('banner')
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
    expect(
      screen
        .getAllByRole('heading', { level: 2 })
        .map((heading) => heading.textContent),
    ).toEqual(['Selected work', 'Approach', 'Interests', 'About', 'Contact'])
  })

  it('/ numera índice e cabeçalhos de seção com os mesmos números', async () => {
    renderAt('/')
    const nav = await screen.findByRole('navigation', { name: 'Contents' })
    const fromIndex = within(nav)
      .getAllByRole('link')
      .map((link) => [
        link.getAttribute('href')?.slice(1),
        link.textContent?.slice(0, 2),
      ])
    const fromSections = screen
      .getAllByRole('heading', { level: 2 })
      .map((heading) => [
        heading.closest('section')?.id,
        heading.previousElementSibling?.textContent,
      ])
    expect(fromSections).toEqual(fromIndex)
  })

  it('/ fecha com o rodapé do shell', async () => {
    renderAt('/')
    const footer = await screen.findByRole('contentinfo')
    expect(
      within(footer).getByText('André Arcodaci — Full Stack Developer'),
    ).toBeVisible()
  })
})

describe('head por rota na navegação', () => {
  beforeEach(() => {
    document.head
      .querySelectorAll('[data-head], title')
      .forEach((node) => node.remove())
  })

  it('navegar da home ao case troca o head sem duplicar', async () => {
    const router = createMemoryRouter(createRoutes(), {
      initialEntries: ['/pt'],
    })
    render(<RouterProvider router={router} />)
    await screen.findByRole('banner')
    expect(
      document.querySelector('link[rel="canonical"]')?.getAttribute('href'),
    ).toBe('http://localhost:5173/pt')
    await act(() => router.navigate('/pt/work/map-areas'))
    expect(document.querySelectorAll('link[rel="canonical"]')).toHaveLength(1)
    expect(
      document.querySelector('link[rel="canonical"]')?.getAttribute('href'),
    ).toBe('http://localhost:5173/pt/work/map-areas')
    await act(() => router.navigate('/pt/nada'))
    expect(
      document.querySelector('meta[name="robots"]')?.getAttribute('content'),
    ).toBe('noindex')
    expect(document.querySelector('link[rel="canonical"]')).toBeNull()
  })

  it('slug inválido recebe o head de 404', async () => {
    renderAt('/work/nao-existe')
    await screen.findByRole('heading', { name: 'Page not found' })
    expect(
      document.querySelector('meta[name="robots"]')?.getAttribute('content'),
    ).toBe('noindex')
    expect(document.querySelector('link[rel="canonical"]')).toBeNull()
  })

  it.each([
    ['/', 'André Arcodaci — Full Stack Developer'],
    ['/work/token-killer', 'Token Killer — André Arcodaci'],
    ['/nada', 'Page not found — André Arcodaci'],
  ])('%s deixa um só <title> no documento', async (url, title) => {
    renderAt(url)
    await screen.findByRole('main')
    await act(async () => {})
    expect(document.querySelectorAll('title').length).toBeLessThanOrEqual(1)
    expect(document.title).toBe(title)
  })
})

describe('rotas sem <title> próprio', () => {
  // React 19 eleva `<title>` para o head, mas `applyHead` só remove o que tem
  // `[data-head]`: um `<title>` a mais no DOM não é garantido de aparecer ou
  // sumir. A guarda real é este teste do fonte das rotas.
  const sources = import.meta.glob('./*Route.tsx', {
    query: '?raw',
    import: 'default',
    eager: true,
  }) as Record<string, string>

  it('nenhum componente de rota declara <title>', () => {
    expect(Object.keys(sources)).toHaveLength(3)
    for (const [file, source] of Object.entries(sources)) {
      expect(source, file).not.toMatch(/<title[\s>]/)
    }
  })
})
