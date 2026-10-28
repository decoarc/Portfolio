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
  it('/work/local-email-client: h1 sem aviso, título e seções', async () => {
    const { site } = contentByLocale.en
    const project = projectOf('en', 'local-email-client')
    renderAt('/work/local-email-client')
    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: 'Local Email Client',
      }),
    ).toBeVisible()
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
    expect(screen.queryByText(site.caseStudy.conceptNotice)).toBeNull()
    expect(screen.queryByText(site.caseStudy.previewNotice)).toBeNull()
    expect(document.title).toBe('Local Email Client — André Arcodaci')
    for (const section of project.sections) {
      expect(
        screen.getByRole('heading', { level: 2, name: section.heading }),
      ).toBeVisible()
    }
  })

  it('/work/local-email-client: ficha técnica como <dl>, com o repositório', async () => {
    const { site } = contentByLocale.en
    renderAt('/work/local-email-client')
    await screen.findByRole('heading', { level: 1 })
    const terms = screen.getAllByRole('term').map((term) => term.textContent)
    expect(terms).toEqual([
      site.caseStudy.roleLabel,
      site.caseStudy.yearLabel,
      site.caseStudy.stackLabel,
      site.caseStudy.linksLabel,
    ])
    expect(
      screen.getByRole('link', {
        name: `${site.links.labels.repo} ${site.links.externalHint}`,
      }),
    ).toHaveAttribute(
      'href',
      'https://github.com/decoarc/Local_Email_Client-LEC',
    )
  })

  it('/work/map-areas: sem aviso, capa, demo e repositório', async () => {
    const { site } = contentByLocale.en
    const project = projectOf('en', 'map-areas')
    renderAt('/work/map-areas')
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Map Areas' }),
    ).toBeVisible()
    expect(screen.queryByText(site.caseStudy.previewNotice)).toBeNull()
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
      screen.getByRole('link', {
        name: `${site.links.labels.repo} ${site.links.externalHint}`,
      }),
    ).toHaveAttribute('href', 'https://github.com/decoarc/geo-areas-php')
  })

  it('/pt/work/map-areas: título e seções em PT, volta para a ficha em /pt', async () => {
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
    ).toHaveAttribute('href', '/pt#work-map-areas')
  })

  it('/work/local-email-client: volta para a ficha do projeto', async () => {
    renderAt('/work/local-email-client')
    expect(
      await screen.findByRole('link', {
        name: contentByLocale.en.site.caseStudy.backToWork,
      }),
    ).toHaveAttribute('href', '/#work-local-email-client')
  })

  it('/work/map-areas: volta para a ficha do projeto', async () => {
    renderAt('/work/map-areas')
    expect(
      await screen.findByRole('link', {
        name: contentByLocale.en.site.caseStudy.backToWork,
      }),
    ).toHaveAttribute('href', '/#work-map-areas')
  })

  it('/pt/work/local-email-client: volta para a ficha em /pt', async () => {
    renderAt('/pt/work/local-email-client')
    expect(
      await screen.findByRole('link', {
        name: contentByLocale.pt.site.caseStudy.backToWork,
      }),
    ).toHaveAttribute('href', '/pt#work-local-email-client')
  })

  it('o h1 recebe o foco ao abrir a página', async () => {
    renderAt('/work/local-email-client')
    const title = await screen.findByRole('heading', { level: 1 })
    expect(title).toHaveAttribute('tabindex', '-1')
    expect(title).toHaveAttribute('data-route-focus')
  })

  it('/work/..%2F dá 404', async () => {
    renderAt('/work/..%2F')
    expect(
      await screen.findByRole('heading', { name: 'Page not found' }),
    ).toBeInTheDocument()
  })

  // O Pages serve /work/Local-Email-Client de work/local-email-client.html: o app casa
  // igual, ou a hidratação trocaria o case pelo 404.
  it('/work/Local-Email-Client abre o case, sem diferenciar caixa', async () => {
    renderAt('/work/Local-Email-Client')
    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: 'Local Email Client',
      }),
    ).toBeInTheDocument()
  })
})
