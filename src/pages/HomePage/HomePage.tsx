import type { ProjectCaseStudy, SiteContent } from '@/content/types'
import { filterPublicProjects } from '@/content'
import { useDocumentTitle } from '@/app/useDocumentTitle'
import { Hero } from '@/sections/Hero'
import { Work } from '@/sections/Work'
import { About } from '@/sections/About'
import { Contact } from '@/sections/Contact'
import styles from './HomePage.module.css'

interface HomePageProps {
  site: SiteContent
  projects: ProjectCaseStudy[]
}

/**
 * Full static homepage (M2b / Gate C).
 * Hero composition is Gate-B locked — do not redesign here.
 */
export function HomePage({ site, projects }: HomePageProps) {
  useDocumentTitle(`${site.person.name} — Portfolio`)
  const listed = filterPublicProjects(projects)

  return (
    <div className={styles.page}>
      <Hero site={site} />
      <Work site={site} projects={listed} />
      <About site={site} />
      <Contact site={site} />
    </div>
  )
}
