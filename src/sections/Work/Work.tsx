import type { Locale, Project, SiteContent } from '../../content/types.ts'
import { caseStudyHref, listProjects } from '../../content/publication.ts'
import { ProjectSlip } from '../../components/ProjectSlip/ProjectSlip.tsx'
import { SectionHead } from '../../components/SectionHead/SectionHead.tsx'
import { Sheet } from '../../components/Sheet/Sheet.tsx'
import styles from './Work.module.css'

interface WorkProps {
  /** Posição da seção na home: o mesmo número do índice. */
  index: number
  copy: SiteContent['work']
  /** Todos os projetos do locale; rascunhos são removidos aqui. */
  projects: Project[]
  locale: Locale
  labels: {
    projectType: SiteContent['projectType']
    links: SiteContent['links']
  }
}

const HEADING_ID = 'work-heading'

/** Trabalhos selecionados: as lâminas do arquivo, separadas por filetes. */
export function Work({ index, copy, projects, locale, labels }: WorkProps) {
  return (
    <Sheet tone="sheet" id="work" labelledBy={HEADING_ID}>
      <SectionHead
        index={index}
        headingId={HEADING_ID}
        title={copy.label}
        intro={copy.intro}
      />
      <ol className={styles.list}>
        {listProjects(projects).map((project, position) => (
          <ProjectSlip
            key={project.slug}
            project={project}
            index={position + 1}
            href={caseStudyHref(locale, project)}
            labels={{
              type: labels.projectType[project.type],
              preview: copy.previewNote,
              links: labels.links,
            }}
          />
        ))}
      </ol>
    </Sheet>
  )
}
