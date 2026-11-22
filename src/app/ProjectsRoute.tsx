import { Link } from 'react-router'
import { ProjectCard } from '../components/ProjectCard/ProjectCard.tsx'
import { Sheet } from '../components/Sheet/Sheet.tsx'
import { caseStudyHref, listProjects } from '../content/publication.ts'
import { localePath } from '../lib/locale.ts'
import { useContent, useLocale } from './LocaleContext.ts'
import styles from './ProjectsRoute.module.css'
import { useRouteHead } from './useRouteHead.ts'

const HEADING_ID = 'projects-title'

/**
 * A galeria: todos os projetos publicados ou em preview, na ordem do
 * conteúdo, em cartões. A home mostra só os primeiros e linka para cá.
 */
export function ProjectsRoute() {
  const locale = useLocale()
  useRouteHead({ locale, page: 'projects' })
  const { site, projects } = useContent()
  const copy = site.gallery
  return (
    <Sheet tone="sheet" labelledBy={HEADING_ID} className={styles.page}>
      <Link to={localePath(locale, '/#work')} className={styles.back}>
        {copy.backToHome}
      </Link>
      <header className={styles.head}>
        <h1
          id={HEADING_ID}
          className={styles.title}
          tabIndex={-1}
          data-route-focus
        >
          {copy.title}
        </h1>
        <p className={styles.intro}>{copy.intro}</p>
      </header>
      <ol className={styles.grid}>
        {listProjects(projects).map((project, position) => (
          <ProjectCard
            key={project.slug}
            project={project}
            index={position + 1}
            href={caseStudyHref(locale, project)}
            labels={{
              type: site.projectType[project.type],
              preview: site.work.previewNote,
              noCapture: site.work.noCapture,
              links: site.links,
            }}
          />
        ))}
      </ol>
    </Sheet>
  )
}
