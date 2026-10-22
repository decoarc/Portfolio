import type { ReactNode } from 'react'
import { Link } from 'react-router'
import type { CaseStudyAccess } from '@/content'
import {
  filterRealBullets,
  getProjectPeriodLabel,
  isPlaceholderContent,
} from '@/content'
import type { ProjectCaseStudy, SiteContent } from '@/content/types'
import styles from './CaseStudyPage.module.css'

interface CaseStudyPageProps {
  site: SiteContent
  project: ProjectCaseStudy
  access: Exclude<CaseStudyAccess, 'unavailable'>
}

function Section({
  id,
  title,
  children,
}: {
  id: string
  title: string
  children: ReactNode
}) {
  return (
    <section className={styles.section} aria-labelledby={id}>
      <h2 id={id} className={styles.sectionTitle}>
        {title}
      </h2>
      <div className={styles.sectionBody}>{children}</div>
    </section>
  )
}

/**
 * Editorial case-study template (Ledger paper + Datum meta + Cut media plate).
 * Preview and published both render verified (non-TBD) sections; homepage CTAs
 * still require published + evidenceComplete.
 */
export function CaseStudyPage({ site, project, access }: CaseStudyPageProps) {
  const copy = site.caseStudy
  const isPreview = access === 'preview'
  const periodLabel = getProjectPeriodLabel(project)

  const problem = !isPlaceholderContent(project.problem) ? project.problem : null
  const responsibilities = filterRealBullets(project.responsibilities)
  const implementation = filterRealBullets(project.implementation)
  const challenges = filterRealBullets(project.challenges)
  const outcomes = filterRealBullets(project.outcomes)
  const gallery = project.gallery ?? []
  /** Cover already leads the page — only show a media section for extra gallery. */
  const showMediaSection = gallery.length > 0

  const isWebp = project.coverImage.src.endsWith('.webp')
  const src800 = isWebp
    ? project.coverImage.src.replace(/\.webp$/, '-800.webp')
    : null

  return (
    <article className={styles.page}>
      <div className={styles.inner}>
        <div className={styles.chrome}>
          <p className={styles.back}>
            <Link to="/#work" className={styles.backLink}>
              {copy.backToWorkLabel}
            </Link>
          </p>

          {isPreview ? (
            <p className={styles.previewStatus} role="status">
              <span className={styles.previewLead}>{copy.previewBanner}</span>
              <span className={styles.previewSep} aria-hidden="true">
                —
              </span>
              <span className={styles.previewNote}>{copy.previewNote}</span>
            </p>
          ) : null}
        </div>

        <header className={styles.hero}>
          <div className={styles.heroCopy}>
            {periodLabel ? (
              <p className={styles.metaRow}>
                <span>
                  {copy.yearLabel} {periodLabel}
                </span>
              </p>
            ) : null}

            <h1 className={styles.title}>{project.title}</h1>
            <p className={styles.tagline}>{project.tagline}</p>

            <p className={styles.stack} aria-label={copy.technologiesLabel}>
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
                  {copy.liveDemoLabel}
                </a>
              ) : null}
              {project.hrefRepo ? (
                <a
                  className={styles.actionSecondary}
                  href={project.hrefRepo}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {copy.repoLabel}
                </a>
              ) : null}
            </div>
          </div>

          <figure className={styles.cover}>
            <picture>
              {src800 ? (
                <source
                  media="(max-width: 48rem)"
                  srcSet={src800}
                  type="image/webp"
                />
              ) : null}
              <img
                className={styles.coverImage}
                src={project.coverImage.src}
                alt={project.coverImage.alt}
                width={project.coverImage.width}
                height={project.coverImage.height}
                decoding="async"
              />
            </picture>
            <figcaption className={styles.coverCaption}>
              {project.coverImage.alt}
            </figcaption>
          </figure>
        </header>

        <Section id="technologies" title={copy.technologiesLabel}>
          <ul className={styles.techList}>
            {project.stack.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </Section>

        {problem ? (
          <Section id="problem" title={copy.problemLabel}>
            <p>{problem}</p>
          </Section>
        ) : null}

        {responsibilities.length > 0 ? (
          <Section id="responsibilities" title={copy.responsibilitiesLabel}>
            <ul>
              {responsibilities.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </Section>
        ) : null}

        {implementation.length > 0 ? (
          <Section id="implementation" title={copy.implementationLabel}>
            <ul>
              {implementation.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </Section>
        ) : null}

        {challenges.length > 0 ? (
          <Section id="challenges" title={copy.challengesLabel}>
            <ul>
              {challenges.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </Section>
        ) : null}

        {outcomes.length > 0 ? (
          <Section id="outcomes" title={copy.outcomesLabel}>
            <ul>
              {outcomes.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </Section>
        ) : null}

        {showMediaSection ? (
          <Section id="media" title={copy.mediaLabel}>
            <ul className={styles.gallery}>
              {gallery.map((asset) => (
                <li key={asset.src}>
                  <figure className={styles.galleryFigure}>
                    <img
                      src={asset.src}
                      alt={asset.alt}
                      width={asset.width}
                      height={asset.height}
                      loading="lazy"
                      decoding="async"
                    />
                  </figure>
                </li>
              ))}
            </ul>
          </Section>
        ) : null}
      </div>
    </article>
  )
}
