import type { CSSProperties } from 'react'
import type { Project, SiteContent } from '../../content/types.ts'
import { listProjects } from '../../content/publication.ts'
import { ProjectThumb } from '../ProjectThumb/ProjectThumb.tsx'
import styles from './CoverStrip.module.css'

interface CoverStripProps {
  /** Todos os projetos do locale; rascunhos saem como na lista. */
  projects: Project[]
  labels: {
    projectType: SiteContent['projectType']
    /** "sem captura": linha do placeholder das miniaturas. */
    noCapture: string
  }
}

/** Giro de cada capa, como no protótipo; cicla se houver mais projetos. */
const TILTS = [-4, 2, -1, 3]

/**
 * Tira de capas da prévia do CTA "Trabalhos selecionados": uma miniatura por
 * projeto da lista da home, na mesma ordem, levemente giradas. Decorativa — o
 * slot da prévia do `ActionLink` já a tira da árvore de acessibilidade.
 */
export function CoverStrip({ projects, labels }: CoverStripProps) {
  return (
    <span className={styles.strip}>
      {listProjects(projects).map((project, position) => (
        <span
          key={project.slug}
          className={styles.cover}
          style={
            {
              '--tilt': `${TILTS[position % TILTS.length]}deg`,
            } as CSSProperties
          }
        >
          <ProjectThumb
            project={project}
            typeLabel={labels.projectType[project.type]}
            noCapture={labels.noCapture}
          />
        </span>
      ))}
    </span>
  )
}
