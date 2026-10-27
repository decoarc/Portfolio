import { describe, expect, it } from 'vitest'
import { contentByLocale } from '../content/index.ts'
import { projectsEn } from '../content/en/projects/index.ts'
import { siteEn } from '../content/en/site.ts'
import { sitePt } from '../content/pt/site.ts'
import { applyHead, renderHeadTags, routeHead } from './head.ts'

const origin = 'https://x.dev'
const mapAreasEn = projectsEn.find((project) => project.slug === 'map-areas')

describe('routeHead', () => {
  it('home PT: título, canonical, alternates e OG', () => {
    const home = routeHead(
      { locale: 'pt', page: 'home' },
      contentByLocale,
      origin,
    )
    expect(home.title).toBe(sitePt.meta.homeTitle)
    expect(home.description).toBe(sitePt.meta.description)
    expect(home.canonical).toBe('https://x.dev/pt')
    expect(home.alternates).toEqual([
      { hreflang: 'en', href: 'https://x.dev/' },
      { hreflang: 'pt-BR', href: 'https://x.dev/pt' },
      { hreflang: 'x-default', href: 'https://x.dev/' },
    ])
    expect(home.og).toMatchObject({
      type: 'website',
      locale: 'pt_BR',
      localeAlternate: 'en_US',
      image: { url: 'https://x.dev/og/home-pt.png', width: 1200, height: 630 },
    })
  })

  it('case study EN: título com sufixo, resumo e artigo', () => {
    const cs = routeHead(
      { locale: 'en', page: 'case', slug: 'map-areas' },
      contentByLocale,
      origin,
    )
    expect(cs.title).toBe(`Map Areas${siteEn.meta.titleSuffix}`)
    expect(cs.description).toBe(mapAreasEn?.summary)
    expect(cs.canonical).toBe('https://x.dev/work/map-areas')
    expect(cs.alternates[1]).toEqual({
      hreflang: 'pt-BR',
      href: 'https://x.dev/pt/work/map-areas',
    })
    expect(cs.og?.type).toBe('article')
  })

  it('404: noindex, sem canonical, alternates nem OG', () => {
    const nf = routeHead(
      { locale: 'en', page: 'notFound' },
      contentByLocale,
      origin,
    )
    expect(nf).toMatchObject({ robots: 'noindex', alternates: [] })
    expect(nf.canonical).toBeUndefined()
    expect(nf.og).toBeUndefined()
  })

  it('case sem acesso lança', () => {
    expect(() =>
      routeHead(
        { locale: 'en', page: 'case', slug: 'nao-existe' },
        contentByLocale,
        origin,
      ),
    ).toThrow()
  })
})

describe('renderHeadTags e applyHead', () => {
  const home = routeHead(
    { locale: 'pt', page: 'home' },
    contentByLocale,
    origin,
  )
  const cs = routeHead(
    { locale: 'en', page: 'case', slug: 'map-areas' },
    contentByLocale,
    origin,
  )
  const nf = routeHead(
    { locale: 'en', page: 'notFound' },
    contentByLocale,
    origin,
  )

  it('escapa valores e marca as tags com data-head', () => {
    const html = renderHeadTags({ ...nf, title: 'A & "B"' })
    expect(html).toContain('<title>A &amp; &quot;B&quot;</title>')
    expect(html).toContain('<meta data-head name="robots" content="noindex">')
  })

  it('applyHead troca as tags sem duplicar', () => {
    applyHead(document, cs)
    applyHead(document, home)
    expect(document.title).toBe(home.title)
    expect(document.querySelectorAll('meta[name="description"]')).toHaveLength(
      1,
    )
    expect(document.querySelectorAll('link[rel="canonical"]')).toHaveLength(1)
    expect(
      document
        .querySelector('meta[property="og:type"]')
        ?.getAttribute('content'),
    ).toBe('website')
    applyHead(document, nf)
    expect(document.querySelector('meta[property^="og:"]')).toBeNull()
    expect(document.querySelector('link[rel="canonical"]')).toBeNull()
  })
})
