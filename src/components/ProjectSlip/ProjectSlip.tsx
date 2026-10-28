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
import styles from './ProjectSlip.module.css'

interface ProjectSlipProps {
  project: Project
  /** Posição na lista (1, 2, …): o número da ficha. */
  index: number
  /** Case study publicado; `null` quando ainda não há página. */
  href: string | null
  labels: {
    /** Rótulo do tipo, já resolvido (`projectType[project.type]`). */
    type: string
    /** Nota mostrada quando não há case study. */
    preview: string
    /** Linha do placeholder da miniatura, depois do tipo. */
    noCapture: string
    links: SiteContent['links']
  }
}

/** Lâmina de índice: uma ficha do arquivo, portada do `.slot` do comp 02. */
export function ProjectSlip({
  project,
  index,
  href,
  labels,
}: ProjectSlipProps) {
  // Quem navega por título ou por link precisa ouvir o tipo (FR-04): um
  // conceito nunca passa por trabalho entregue.
  const typeName = <span className="visually-hidden">{labels.type}: </span>
  // O nome de transição só vale na ficha envolvida (ida para o case dela ou
  // volta dele): o nome precisa ser único na página.
  const flying = useViewTransitionState(href ?? '') && href !== null
  // A ficha mostra um link só, de preferência a demo; o case lista todos.
  const slipLink =
    project.links.find((link) => link.kind === 'live') ?? project.links[0]
  return (
    // `data-motion` marca quem tem transição e serve de gancho para a reação
    // da lista (Work.module.css), sem compor classes entre módulos.
    <li
      id={workAnchor(project.slug)}
      className={styles.slip}
      data-motion="slip"
    >
      <p className={styles.meta}>
        <span className={styles.index}>{String(index).padStart(2, '0')}</span>
        {/* O tipo já entra no nome do título; aqui fica só o rótulo visual. */}
        <span className={styles.type} aria-hidden="true">
          {labels.type}
        </span>
      </p>
      {/* A reação mexe no título, não no link: um case em preview não tem link. */}
      <h3
        className={styles.title}
        data-motion="slip-title"
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
      </h3>
      <div className={styles.body}>
        <p className={styles.summary}>{project.summary}</p>
        {href === null && <p className={styles.note}>{labels.preview}</p>}
      </div>
      <p className={styles.stack}>
        <span>{project.stack.join(' · ')}</span>
        {slipLink && (
          <ExternalLink href={slipLink.href} hint={labels.links.externalHint}>
            {labels.links.labels[slipLink.kind]}
          </ExternalLink>
        )}
      </p>
      <p className={styles.year}>{project.year}</p>
      {/* Não é link: o título continua sendo o único alvo da ficha. */}
      <ProjectThumb
        project={project}
        typeLabel={labels.type}
        noCapture={labels.noCapture}
      />
    </li>
  )
}
