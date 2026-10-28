import { caseStudyAccess } from '../content/publication.ts'
import type { Locale, LocaleContent } from '../content/types.ts'
import { locales, localePath } from '../lib/locale.ts'
import type { RouteKey } from './head.ts'

/**
 * Uma página do prerender: a rota, a URL que o app renderiza e o arquivo em
 * `dist/` (relativo, com `/`) que o Cloudflare Pages serve para ela (§5.2).
 */
export interface PrerenderRoute {
  key: RouteKey
  url: string
  file: string
}

/** Caminho qualquer que não casa com rota do app: renderiza o 404. */
const NOT_FOUND_PATH = '/nao-encontrada'

/** `/` → `index.html`; `/pt` → `pt.html`; `/pt/work/x` → `pt/work/x.html`. */
function fileFor(url: string): string {
  return url === '/' ? 'index.html' : `${url.slice(1)}.html`
}

/**
 * A lista sai do conteúdo: home e 404 de cada locale, mais o case de todo
 * projeto com `caseStudyAccess !== 'none'` (rascunho não gera arquivo).
 * Sem React nem DOM: o e2e e o `scripts/prerender.ts` importam no Node.
 */
export function prerenderRoutes(
  content: Record<Locale, LocaleContent>,
): PrerenderRoute[] {
  const routes: PrerenderRoute[] = []
  for (const locale of locales) {
    const home = localePath(locale, '/')
    routes.push({
      key: { locale, page: 'home' },
      url: home,
      file: fileFor(home),
    })

    for (const project of content[locale].projects) {
      if (caseStudyAccess(project) === 'none') continue
      const url = localePath(locale, `/work/${project.slug}`)
      routes.push({
        key: { locale, page: 'case', slug: project.slug },
        url,
        file: fileFor(url),
      })
    }

    // O 404 mais próximo do caminho: `404.html` na raiz, `pt/404.html` sob /pt.
    routes.push({
      key: { locale, page: 'notFound' },
      url: localePath(locale, NOT_FOUND_PATH),
      file: locale === 'en' ? '404.html' : `${locale}/404.html`,
    })
  }
  return routes
}
