import { caseStudyAccess, findProject } from '../content/publication.ts'
import type { Locale, LocaleContent } from '../content/types.ts'
import { localePath } from '../lib/locale.ts'

/**
 * Modelo puro do `<head>` por rota. Sem React nem globais de DOM: o prerender
 * importa este arquivo no Node, e `applyHead` recebe o `Document`.
 */

export type RouteKey =
  | { locale: Locale; page: 'home' }
  | { locale: Locale; page: 'case'; slug: string }
  | { locale: Locale; page: 'notFound' }

export interface RouteHead {
  title: string
  description: string
  canonical?: string
  alternates: { hreflang: 'en' | 'pt-BR' | 'x-default'; href: string }[]
  robots?: 'noindex'
  og?: {
    type: 'website' | 'article'
    url: string
    title: string
    description: string
    siteName: string
    locale: 'en_US' | 'pt_BR'
    localeAlternate: 'en_US' | 'pt_BR'
    image: { url: string; width: 1200; height: 630; alt: string }
  }
}

const ogLocale = { en: 'en_US', pt: 'pt_BR' } as const

function absolute(origin: string, locale: Locale, path: string): string {
  const local = localePath(locale, path)
  return local === '/' ? `${origin}/` : `${origin}${local}`
}

export function routeHead(
  key: RouteKey,
  content: Record<Locale, LocaleContent>,
  origin: string,
): RouteHead {
  const { locale } = key
  const { site, projects } = content[locale]

  if (key.page === 'notFound') {
    return {
      title: `${site.notFound.title}${site.meta.titleSuffix}`,
      description: site.meta.description,
      alternates: [],
      robots: 'noindex',
    }
  }

  let path = '/'
  let title = site.meta.homeTitle
  let description = site.meta.description
  let ogType: 'website' | 'article' = 'website'
  const imagePath = `/og/home-${locale}.png`

  if (key.page === 'case') {
    const project = findProject(projects, key.slug)
    if (!project || caseStudyAccess(project) === 'none') {
      throw new Error(
        `routeHead: case study inexistente ou sem acesso: ${key.slug}`,
      )
    }
    path = `/work/${project.slug}`
    title = `${project.title}${site.meta.titleSuffix}`
    description = project.summary
    ogType = 'article'
  }

  const canonical = absolute(origin, locale, path)
  const other: Locale = locale === 'en' ? 'pt' : 'en'
  const enUrl = absolute(origin, 'en', path)

  return {
    title,
    description,
    canonical,
    alternates: [
      { hreflang: 'en', href: enUrl },
      { hreflang: 'pt-BR', href: absolute(origin, 'pt', path) },
      { hreflang: 'x-default', href: enUrl },
    ],
    og: {
      type: ogType,
      url: canonical,
      title,
      description,
      siteName: site.person.name,
      locale: ogLocale[locale],
      localeAlternate: ogLocale[other],
      image: {
        url: `${origin}${imagePath}`,
        width: 1200,
        height: 630,
        alt: site.meta.ogImageAlt,
      },
    },
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function metaName(name: string, content: string): string {
  return `<meta data-head name="${name}" content="${escapeHtml(content)}">`
}

function metaProperty(property: string, content: string | number): string {
  return `<meta data-head property="${property}" content="${escapeHtml(String(content))}">`
}

/** Tags do head: `<title>` primeiro; as demais carregam `data-head`. */
export function renderHeadTags(head: RouteHead): string {
  const tags: string[] = [`<title>${escapeHtml(head.title)}</title>`]
  tags.push(metaName('description', head.description))
  if (head.robots) tags.push(metaName('robots', head.robots))
  if (head.canonical) {
    tags.push(
      `<link data-head rel="canonical" href="${escapeHtml(head.canonical)}">`,
    )
  }
  for (const alt of head.alternates) {
    tags.push(
      `<link data-head rel="alternate" hreflang="${alt.hreflang}" href="${escapeHtml(alt.href)}">`,
    )
  }
  if (head.og) {
    const { og } = head
    tags.push(
      metaProperty('og:type', og.type),
      metaProperty('og:url', og.url),
      metaProperty('og:title', og.title),
      metaProperty('og:description', og.description),
      metaProperty('og:site_name', og.siteName),
      metaProperty('og:locale', og.locale),
      metaProperty('og:locale:alternate', og.localeAlternate),
      metaProperty('og:image', og.image.url),
      metaProperty('og:image:width', og.image.width),
      metaProperty('og:image:height', og.image.height),
      metaProperty('og:image:alt', og.image.alt),
      metaName('twitter:card', 'summary_large_image'),
      metaName('twitter:title', og.title),
      metaName('twitter:description', og.description),
      metaName('twitter:image', og.image.url),
      metaName('twitter:image:alt', og.image.alt),
    )
  }
  return tags.join('\n')
}

export function applyHead(doc: Document, head: RouteHead): void {
  doc.title = head.title
  doc.head.querySelectorAll('[data-head]').forEach((node) => node.remove())
  // O <title> é cuidado por `doc.title`; só as demais tags entram aqui.
  const withoutTitle = renderHeadTags(head).split('\n').slice(1).join('\n')
  doc.head.insertAdjacentHTML('beforeend', withoutTitle)
}
