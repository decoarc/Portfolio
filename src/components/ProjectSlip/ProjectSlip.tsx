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
  return (
    <li className={styles.slip}>
      <p className={styles.meta}>
        <span className={styles.index}>{String(index).padStart(2, '0')}</span>
        <span className={styles.type}>{labels.type}</span>
      </p>
      <h3 className={styles.title}>
        {href ? (
          <Link to={href} className={styles.titleLink}>
            {project.title}
          </Link>
        ) : (
          project.title
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
            key={link.kind}
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
