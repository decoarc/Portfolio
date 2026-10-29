import type { Project } from '../../content/types.ts'
import { assetUrl } from '../../lib/basePath.ts'
import styles from './ProjectThumb.module.css'

interface ProjectThumbProps {
  project: Project
  /** Rótulo do tipo, já resolvido (`projectType[project.type]`). */
  typeLabel: string
  /** "sem captura": completa a linha do placeholder. */
  noCapture: string
}

/**
 * Miniatura 4:3 de um projeto: a captura quando há `cover`, senão o
 * placeholder escuro do protótipo. Decorativa — o título da ficha já nomeia o
 * projeto —, então fica fora da árvore de acessibilidade. O filho leva
 * `data-motion="thumb"`: é ele que cresce dentro da moldura no hover/foco.
 */
export function ProjectThumb({
  project,
  typeLabel,
  noCapture,
}: ProjectThumbProps) {
  const { cover } = project
  return (
    <div className={styles.thumb} aria-hidden="true">
      {cover ? (
        <img
          className={styles.media}
          data-motion="thumb"
          src={assetUrl(cover.thumbSrc ?? cover.src)}
          alt=""
          // A versão de 800px é sempre 800×600; sem ela, as medidas da capa.
          width={cover.thumbSrc ? 800 : cover.width}
          height={cover.thumbSrc ? 600 : cover.height}
          loading="lazy"
          decoding="async"
        />
      ) : (
        <div
          className={`${styles.media} ${styles.placeholder}`}
          data-motion="thumb"
        >
          {/* "sem captura" não se parte: a linha quebra no ponto, nunca
              entre "sem" e "captura". */}
          <span className={styles.line}>
            {`${typeLabel} · `}
            <span className={styles.keep}>{noCapture}</span>
          </span>
          <span className={styles.title}>{project.title}</span>
        </div>
      )}
    </div>
  )
}
