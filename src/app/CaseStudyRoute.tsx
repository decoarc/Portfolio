import { Link, useParams } from 'react-router'
import { ExternalLink } from '../components/ExternalLink/ExternalLink.tsx'
import { Sheet } from '../components/Sheet/Sheet.tsx'
import {
  caseStudyAccess,
  findProject,
  workAnchor,
} from '../content/publication.ts'
import { localePath } from '../lib/locale.ts'
import styles from './CaseStudyRoute.module.css'
import { INSTANT_SCROLL } from './navigationState.ts'
import { useContent, useLocale } from './LocaleContext.ts'
import { NotFoundRoute } from './NotFoundRoute.tsx'

const HEADING_ID = 'case-study-title'

/**
 * Case study: a ficha aberta. A ficha técnica fica no trilho de margem a
 * partir de 768px; abaixo disso, entra em linha antes do resumo.
 */
export function CaseStudyRoute() {
  const { slug } = useParams()
  const locale = useLocale()
  const { site, projects } = useContent()
  const project = findProject(projects, slug)
  const access = caseStudyAccess(project)
  if (!project || access === 'none') return <NotFoundRoute />

  const copy = site.caseStudy
  return (
    <Sheet tone="sheet" labelledBy={HEADING_ID} className={styles.page}>
      <title>{`${project.title}${site.meta.titleSuffix}`}</title>
      <Link
        to={localePath(locale, `/#${workAnchor(project.slug)}`)}
        state={INSTANT_SCROLL}
        className={styles.back}
      >
        {copy.backToWork}
      </Link>

      <header className={styles.head}>
        {access === 'preview' && (
          <p className={styles.notice}>{copy.previewNotice}</p>
        )}
        <p className={styles.type}>{site.projectType[project.type]}</p>
        <h1
          id={HEADING_ID}
          className={styles.title}
          tabIndex={-1}
          data-route-focus
        >
          {project.title}
        </h1>
        {project.type === 'concept' && (
          <p className={styles.notice}>{copy.conceptNotice}</p>
        )}
      </header>

      <div className={styles.body}>
        <dl className={styles.facts}>
          <div className={styles.fact}>
            <dt>{copy.roleLabel}</dt>
            <dd>{project.role}</dd>
          </div>
          <div className={styles.fact}>
            <dt>{copy.yearLabel}</dt>
            <dd>{project.year}</dd>
          </div>
          <div className={styles.fact}>
            <dt>{copy.stackLabel}</dt>
            {project.stack.map((item) => (
              <dd key={item} className={styles.stackItem}>
                {item}
              </dd>
            ))}
          </div>
          {project.links.length > 0 && (
            <div className={styles.fact}>
              <dt>{copy.linksLabel}</dt>
              {project.links.map((link) => (
                <dd key={link.href}>
                  <ExternalLink href={link.href} hint={site.links.externalHint}>
                    {site.links.labels[link.kind]}
                  </ExternalLink>
                </dd>
              ))}
            </div>
          )}
        </dl>

        <div className={styles.text}>
          <p className={styles.summary}>{project.summary}</p>
          {project.cover && (
            <img
              className={styles.cover}
              src={project.cover.src}
              alt={project.cover.alt}
              width={project.cover.width}
              height={project.cover.height}
              loading="eager"
            />
          )}
          {project.sections.map((section) => (
            <section key={section.heading} className={styles.section}>
              <h2 className={styles.sectionTitle}>{section.heading}</h2>
              {section.paragraphs?.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
              {section.items && section.items.length > 0 && (
                <ul className={styles.items}>
                  {section.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>
      </div>
    </Sheet>
  )
}
