import { render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { describe, expect, it } from 'vitest'
import { contentByLocale } from '../content/index.ts'
import type { Locale } from '../content/types.ts'
import { createRoutes } from './routes.tsx'

function renderAt(url: string) {
  const router = createMemoryRouter(createRoutes(), { initialEntries: [url] })
  return render(<RouterProvider router={router} />)
}

function projectOf(locale: Locale, slug: string) {
  const project = contentByLocale[locale].projects.find(
    (item) => item.slug === slug,
  )
  if (!project) throw new Error(`projeto ausente: ${slug}`)
  return project
}

describe('case study', () => {
  it('/work/token-killer: h1, aviso de conceito, título e seções', async () => {
    const { site } = contentByLocale.en
    const project = projectOf('en', 'token-killer')
    renderAt('/work/token-killer')
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Token Killer' }),
    ).toBeVisible()
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
    expect(screen.getByText(site.caseStudy.conceptNotice)).toBeVisible()
    expect(screen.queryByText(site.caseStudy.previewNotice)).toBeNull()
    expect(document.title).toBe('Token Killer — André Arcodaci')
    for (const section of project.sections) {
      expect(
        screen.getByRole('heading', { level: 2, name: section.heading }),
      ).toBeVisible()
    }
  })

  it('/work/token-killer: ficha técnica como <dl>, sem linha de links vazia', async () => {
    const { site } = contentByLocale.en
    renderAt('/work/token-killer')
    await screen.findByRole('heading', { level: 1 })
    const terms = screen.getAllByRole('term').map((term) => term.textContent)
    expect(terms).toEqual([
      site.caseStudy.roleLabel,
      site.caseStudy.yearLabel,
      site.caseStudy.stackLabel,
    ])
  })

  it('/work/map-areas: aviso de preview, capa, demo e nenhum repositório', async () => {
    const { site } = contentByLocale.en
    const project = projectOf('en', 'map-areas')
    renderAt('/work/map-areas')
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Map Areas' }),
    ).toBeVisible()
    expect(screen.getByText(site.caseStudy.previewNotice)).toBeVisible()
    expect(screen.queryByText(site.caseStudy.conceptNotice)).toBeNull()

    const cover = screen.getByRole('img', { name: project.cover?.alt })
    expect(cover).toHaveAttribute('width', '1200')
    expect(cover).toHaveAttribute('height', '900')
    expect(cover).toHaveAttribute('loading', 'eager')

    const demo = screen.getByRole('link', {
      name: `${site.links.labels.live} ${site.links.externalHint}`,
    })
    expect(demo).toHaveAttribute('href', 'https://geo-areas-php.onrender.com/')
    expect(
      screen.queryByRole('link', {
        name: new RegExp(site.links.labels.repo),
      }),
    ).toBeNull()
  })

  it('o aviso de preview vem acima do título', async () => {
    const { site } = contentByLocale.en
    renderAt('/work/map-areas')
    const title = await screen.findByRole('heading', { level: 1 })
    const notice = screen.getByText(site.caseStudy.previewNotice)
    expect(
      notice.compareDocumentPosition(title) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()
  })

  it('/pt/work/map-areas: título e seções em PT, volta para /pt#work', async () => {
    const { site } = contentByLocale.pt
    const project = projectOf('pt', 'map-areas')
    renderAt('/pt/work/map-areas')
    expect(
      await screen.findByRole('heading', { level: 1, name: project.title }),
    ).toBeVisible()
    expect(document.title).toBe(`${project.title}${site.meta.titleSuffix}`)
    for (const section of project.sections) {
      expect(
        screen.getByRole('heading', { level: 2, name: section.heading }),
      ).toBeVisible()
    }
    expect(screen.getByText(project.summary)).toBeVisible()
    expect(
      screen.getByRole('link', { name: site.caseStudy.backToWork }),
    ).toHaveAttribute('href', '/pt#work')
  })

  it('/work/token-killer: volta para /#work', async () => {
    renderAt('/work/token-killer')
    expect(
      await screen.findByRole('link', {
        name: contentByLocale.en.site.caseStudy.backToWork,
      }),
    ).toHaveAttribute('href', '/#work')
  })

  it.each(['/work/Token-Killer', '/work/..%2F'])('%s dá 404', async (url) => {
    renderAt(url)
    expect(
      await screen.findByRole('heading', { name: 'Page not found' }),
    ).toBeInTheDocument()
  })
})
