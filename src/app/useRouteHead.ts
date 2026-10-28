import { useEffect } from 'react'
import { contentByLocale } from '../content/index.ts'
import { applyHead, routeHead, type RouteKey } from './head.ts'
import { siteOrigin } from './siteOrigin.ts'

/** Aplica o `<head>` da rota ao documento a cada mudança de rota. */
export function useRouteHead(key: RouteKey): void {
  const { locale, page } = key
  const slug = key.page === 'case' ? key.slug : undefined
  useEffect(() => {
    const route: RouteKey =
      page === 'case'
        ? { locale, page, slug: slug as string }
        : { locale, page }
    applyHead(document, routeHead(route, contentByLocale, siteOrigin()))
  }, [locale, page, slug])
}
