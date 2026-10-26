import type { RouteObject } from 'react-router'
import { CaseStudyRoute } from './CaseStudyRoute.tsx'
import { HomeRoute } from './HomeRoute.tsx'
import { LocaleLayout } from './LocaleLayout.tsx'
import { NotFoundRoute } from './NotFoundRoute.tsx'

function children(): RouteObject[] {
  return [
    { index: true, element: <HomeRoute /> },
    { path: 'work/:slug', element: <CaseStudyRoute /> },
    { path: '*', element: <NotFoundRoute /> },
  ]
}

/** Dois subtrees: PT sob `/pt`, EN na raiz. */
export function createRoutes(): RouteObject[] {
  return [
    {
      path: '/pt',
      element: <LocaleLayout locale="pt" />,
      children: children(),
    },
    { path: '/', element: <LocaleLayout locale="en" />, children: children() },
  ]
}
