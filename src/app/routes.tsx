import { HomePage } from '@/pages/HomePage'
import { getProjects, getSiteContent } from '@/content'

/**
 * M1 home-only shell. Case-study routes wait for hosting + SPA fallback (Gate D).
 * React Router can replace this map later without changing page components.
 */
export function HomeRoute() {
  const site = getSiteContent('en')
  const projects = getProjects('en')
  return <HomePage site={site} projects={projects} />
}
