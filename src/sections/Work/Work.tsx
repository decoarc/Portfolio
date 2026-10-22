import type { ProjectCaseStudy, SiteContent } from '@/content/types'
import { getProjectHref } from '@/content'
import { MotionReveal } from '@/motion'
import styles from './Work.module.css'

interface WorkProps {
  site: SiteContent
  projects: ProjectCaseStudy[]
}

/**
 * Selected work — Ledger list + Datum title-blocks.
 * MP-2/MP-3: project interactions + section reveal.
 */
export function Work({ site, projects }: WorkProps) {
  const { work } = site

  return (
    <section id="work" className={styles.work} aria-labelledby="work-heading">
      <div className={styles.inner}>
        <MotionReveal>
          <header className={styles.header}>
            <p className={styles.index} aria-hidden="true">
              02
            </p>
            <div className={styles.headerCopy}>
              <h2 id="work-heading" className={styles.title}>
                {work.title}
              </h2>
              <p className={styles.intro}>{work.intro}</p>
            </div>
          </header>
        </MotionReveal>

        <ul className={styles.list}>
          {projects.map((project, index) => {
            const caseStudyHref = getProjectHref(project)
            const plateNumber = String(index + 1).padStart(2, '0')
            const isWebp = project.coverImage.src.endsWith('.webp')
            const src800 = isWebp
              ? project.coverImage.src.replace(/\.webp$/, '-800.webp')
              : null

            return (
              <MotionReveal
                key={project.slug}
                as="li"
                className={styles.project}
                delayMs={index * 70}
              >
                <div className={styles.media}>
                  <picture>
                    {src800 ? (
                      <source
                        media="(max-width: 48rem)"
                        srcSet={src800}
                        type="image/webp"
                      />
                    ) : null}
                    <img
                      src={project.coverImage.src}
                      alt={project.coverImage.alt}
                      width={project.coverImage.width}
                      height={project.coverImage.height}
                      loading="lazy"
                      decoding="async"
                    />
                  </picture>
                </div>

                <div className={styles.block}>
                  <div className={styles.blockMeta}>
                    <span className={styles.plateNum}>{plateNumber}</span>
                    <span className={styles.status}>
                      {project.status === 'preview'
                        ? work.previewStatusNote
                        : project.status}
                    </span>
                  </div>

                  <h3 className={styles.projectTitle}>{project.title}</h3>
                  <p className={styles.tagline}>{project.tagline}</p>

                  <p className={styles.stack}>
                    {project.stack.map((item, i) => (
                      <span key={item}>
                        {i > 0 ? (
                          <span aria-hidden="true" className={styles.stackSep}>
                            {' / '}
                          </span>
                        ) : null}
                        {item}
                      </span>
                    ))}
                  </p>

                  <div className={styles.actions}>
                    {project.hrefLive ? (
                      <a
                        className={styles.actionPrimary}
                        href={project.hrefLive}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {work.liveDemoLabel}
                      </a>
                    ) : null}
                    {caseStudyHref ? (
                      <a className={styles.actionSecondary} href={caseStudyHref}>
                        {work.caseStudyLabel}
                      </a>
                    ) : (
                      <span className={styles.soon}>
                        {work.caseStudySoonLabel}
                      </span>
                    )}
                  </div>
                </div>
              </MotionReveal>
            )
          })}
        </ul>

        <MotionReveal delayMs={80}>
          <p className={styles.moreSoon}>{work.moreSoonNote}</p>
        </MotionReveal>
      </div>
    </section>
  )
}
