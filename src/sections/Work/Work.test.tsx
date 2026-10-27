import { fireEvent, render, screen, within } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { describe, expect, it } from 'vitest'
import { INSTANT_SCROLL } from '../../app/navigationState.ts'
import { siteEn } from '../../content/en/site.ts'
import { sitePt } from '../../content/pt/site.ts'
import type { Locale, Project, SiteContent } from '../../content/types.ts'
import { Work } from './Work.tsx'

function makeProjects(
  count: number,
  overrides: Partial<Project> = {},
): Project[] {
  return Array.from({ length: count }, (_, i) => ({
    slug: `projeto-${i + 1}`,
    title: `Projeto ${i + 1}`,
    type: 'concept' as const,
    status: 'published' as const,
    summary: `Resumo ${i + 1}.`,
    role: 'Dev',
    year: '2025',
    stack: ['React'],
    sections: [],
    links: [],
    ...overrides,
  }))
}

function renderWork(
  projects: Project[],
  locale: Locale = 'en',
  site: SiteContent = siteEn,
  state: unknown = null,
) {
  // Data router: as fichas usam `useViewTransitionState`, que exige um.
  const router = createMemoryRouter(
    [
      {
        path: '*',
        element: (
          <Work
            index={1}
            copy={site.work}
            projects={projects}
            locale={locale}
            labels={{ projectType: site.projectType, links: site.links }}
          />
        ),
      },
    ],
    { initialEntries: [{ pathname: '/', state }] },
  )
  return render(<RouterProvider router={router} />)
}

function slipNumbers(): string[] {
  return screen
    .getAllByRole('listitem')
    .map((item) => within(item).getByText(/^\d{2}$/).textContent ?? '')
}

describe('Work', () => {
  it('é a seção #work, nomeada pelo rótulo', () => {
    renderWork(makeProjects(2))
    const section = screen.getByRole('region', { name: siteEn.work.label })
    expect(section).toHaveAttribute('id', 'work')
  })

  it.each([2, 8])('com %i projetos, numera de 01 até o total', (count) => {
    renderWork(makeProjects(count))
    expect(screen.getAllByRole('listitem')).toHaveLength(count)
    expect(slipNumbers()).toEqual(
      Array.from({ length: count }, (_, i) => String(i + 1).padStart(2, '0')),
    )
  })

  it('rascunho não aparece', () => {
    const projects = [
      ...makeProjects(2),
      ...makeProjects(1, {
        slug: 'rascunho',
        title: 'Rascunho',
        status: 'draft',
      }),
    ]
    renderWork(projects)
    expect(screen.getAllByRole('listitem')).toHaveLength(2)
    expect(screen.queryByText('Rascunho')).toBeNull()
  })

  it('em pt, os títulos levam a /pt/work/', () => {
    const projects = makeProjects(2)
    renderWork(projects, 'pt', sitePt)
    for (const item of projects) {
      expect(
        screen.getByRole('link', { name: new RegExp(item.title) }),
      ).toHaveAttribute('href', `/pt/work/${item.slug}`)
    }
  })

  it('o cabeçalho é um h2 com o número da seção', () => {
    renderWork(makeProjects(1))
    expect(
      screen.getByRole('heading', { level: 2, name: siteEn.work.label }),
    ).toBeVisible()
    expect(screen.getByText(siteEn.work.intro)).toBeVisible()
  })

  it('vindo de um case (rolagem imediata), a lista pousa em repouso até o primeiro gesto', () => {
    renderWork(makeProjects(2), 'en', siteEn, INSTANT_SCROLL)
    const list = screen.getByRole('list')
    expect(list).toHaveAttribute('data-settling')
    fireEvent.pointerMove(window)
    expect(list).not.toHaveAttribute('data-settling')
  })

  for (const type of ['keyDown', 'wheel', 'touchStart'] as const) {
    it(`o repouso também acaba com ${type}`, () => {
      renderWork(makeProjects(2), 'en', siteEn, INSTANT_SCROLL)
      const list = screen.getByRole('list')
      expect(list).toHaveAttribute('data-settling')
      fireEvent[type](window)
      expect(list).not.toHaveAttribute('data-settling')
    })
  }

  it('numa visita comum, a lista não fica em repouso', () => {
    renderWork(makeProjects(2))
    expect(screen.getByRole('list')).not.toHaveAttribute('data-settling')
  })
})
