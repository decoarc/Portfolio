import { useParams } from 'react-router'
import { caseStudyAccess, findProject } from '../content/publication.ts'
import { useContent } from './LocaleContext.ts'
import { NotFoundRoute } from './NotFoundRoute.tsx'

/** Stub: resolve o acesso e cai na 404 para tudo. O corpo entra na Task 7. */
export function CaseStudyRoute() {
  const { slug } = useParams()
  const { projects } = useContent()
  const access = caseStudyAccess(findProject(projects, slug))
  // Task 7: 'full' e 'preview' renderizam o case study.
  if (access === 'none') return <NotFoundRoute />
  return <NotFoundRoute />
}
