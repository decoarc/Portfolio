import { Link, useViewTransitionState } from 'react-router'
import { workAnchor } from '../../content/publication.ts'
import type { Project, SiteContent } from '../../content/types.ts'
import {
  canFly,
  markTitleFlight,
  TITLE_FLIGHT,
} from '../../motion/titleFlight.ts'
import { ExternalLink } from '../ExternalLink/ExternalLink.tsx'
import { ProjectThumb } from '../ProjectThumb/ProjectThumb.tsx'
import styles from './ProjectCard.module.css'

interface ProjectCardProps {
  project: Project
  /** Posição na galeria (1, 2, …): o número do cartão. */
  index: number
  /** Case study publicado; `null` quando ainda não há página. */
  href: string | null
  labels: {
    /** Rótulo do tipo, já resolvido (`projectType[project.type]`). */
    type: string
    /** Nota mostrada quando não há case study. */
    preview: string
    noCapture: string
    links: SiteContent['links']
  }
}

/**
 * Cartão da galeria (`/projects`): a miniatura em cima, depois número, tipo,
 * título, resumo e stack. Mesmo contrato da ficha da home (`ProjectSlip`): o
 * id da âncora, o título como único alvo interno e o título que viaja até o
 * case study.
 */
export function ProjectCard({
  project,
  index,
  href,
  labels,
}: ProjectCardProps) {
  const typeName = <span className="visually-hidden">{labels.type}: </span>
  const flying = useViewTransitionState(href ?? '') && href !== null
  const cardLink =
    project.links.find((link) => link.kind === 'live') ?? project.links[0]
  return (
    <li
      id={workAnchor(project.slug)}
      className={styles.card}
      data-motion="card"
    >
      <ProjectThumb
        project={project}
        typeLabel={labels.type}
        noCapture={labels.noCapture}
      />
      <p className={styles.meta}>
        <span className={styles.index}>{String(index).padStart(2, '0')}</span>
        <span className={styles.type} aria-hidden="true">
          {labels.type}
        </span>
        <span className={styles.year}>{project.year}</span>
      </p>
      <h2
        className={styles.title}
        {...(href === null && { 'data-anchor-focus': true, tabIndex: -1 })}
      >
        {href ? (
          <Link
            to={href}
            className={styles.titleLink}
            data-anchor-focus
            viewTransition={canFly()}
            onClick={() => markTitleFlight('open')}
            style={
              flying ? { viewTransitionName: TITLE_FLIGHT.title } : undefined
            }
          >
            {typeName}
            {project.title}
          </Link>
        ) : (
          <>
            {typeName}
            {project.title}
          </>
        )}
      </h2>
      <p className={styles.summary}>{project.summary}</p>
      {href === null && <p className={styles.note}>{labels.preview}</p>}
      <p className={styles.stack}>
        <span>{project.stack.join(' · ')}</span>
        {cardLink && (
          <ExternalLink href={cardLink.href} hint={labels.links.externalHint}>
            {labels.links.labels[cardLink.kind]}
          </ExternalLink>
        )}
      </p>
    </li>
  )
}
