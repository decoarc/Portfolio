import type { RouteObject } from 'react-router'
import { Navigate } from 'react-router'
import { CaseStudyRoute, HomeRoute, NotFoundRoute } from './routeElements'

export function createAppRoutes(): RouteObject[] {
  return [
    { path: '/', element: <HomeRoute /> },
    { path: '/work/:slug', element: <CaseStudyRoute /> },
    { path: '/work', element: <Navigate to="/#work" replace /> },
    { path: '*', element: <NotFoundRoute /> },
  ]
}
