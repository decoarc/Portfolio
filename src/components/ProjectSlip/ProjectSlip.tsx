import { Link } from 'react-router'
import type { Project, SiteContent } from '../../content/types.ts'
import { ExternalLink } from '../ExternalLink/ExternalLink.tsx'
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
  return (
    <li className={styles.slip}>
      <p className={styles.meta}>
        <span className={styles.index}>{String(index).padStart(2, '0')}</span>
        {/* O tipo já entra no nome do título; aqui fica só o rótulo visual. */}
        <span className={styles.type} aria-hidden="true">
          {labels.type}
        </span>
      </p>
      <h3 className={styles.title}>
        {href ? (
          <Link to={href} className={styles.titleLink}>
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
        {project.links.map((link) => (
          <ExternalLink
            key={link.href}
            href={link.href}
            hint={labels.links.externalHint}
          >
            {labels.links.labels[link.kind]}
          </ExternalLink>
        ))}
      </p>
      <p className={styles.year}>{project.year}</p>
    </li>
  )
}
