import type { ProjectCaseStudy, SiteContent } from '@/content/types'
import { filterPublicProjects, getProjectHref } from '@/content'
import styles from './HomePage.module.css'

interface HomePageProps {
  site: SiteContent
  projects: ProjectCaseStudy[]
}

/**
 * Minimal home shell for M1 — not the complete homepage composition (M2).
 */
export function HomePage({ site, projects }: HomePageProps) {
  const listed = filterPublicProjects(projects)

  return (
    <div className={styles.page}>
      <section className={styles.identity} aria-labelledby="home-name">
        <div className="u-container">
          <p className={`meta ${styles.index}`}>01 / Identity</p>
          <h1 id="home-name" className={styles.name}>
            {site.person.name}
          </h1>
          <p className={styles.role}>{site.person.role}</p>
          <p className={styles.location}>{site.person.locationLabel}</p>
          <p className={styles.bio}>{site.person.shortBio}</p>
          <p className={styles.note}>
            Homepage composition lands in M2 after first-viewport design
            approval. This page proves the shell, tokens, and content seams.
          </p>
        </div>
      </section>

      <section
        id="work"
        className={styles.work}
        aria-labelledby="work-heading"
      >
        <div className="u-container">
          <p className="meta">02 / Work</p>
          <h2 id="work-heading" className={styles.sectionTitle}>
            Selected work
          </h2>
          <ul className={styles.projectList}>
            {listed.map((project) => {
              const caseStudyHref = getProjectHref(project)
              return (
                <li key={project.slug} className={styles.projectRow}>
                  <div>
                    <h3 className={styles.projectTitle}>{project.title}</h3>
                    <p className={styles.projectTagline}>{project.tagline}</p>
                    <p className={`meta ${styles.projectMeta}`}>
                      <span>{project.status}</span>
                      <span aria-hidden="true"> · </span>
                      <span>{project.stack.join(' / ')}</span>
                    </p>
                  </div>
                  <div className={styles.projectActions}>
                    {project.hrefLive ? (
                      <a
                        href={project.hrefLive}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Live demo
                      </a>
                    ) : null}
                    {caseStudyHref ? (
                      <a href={caseStudyHref}>Case study</a>
                    ) : (
                      <span className={styles.comingSoon}>Case study soon</span>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      </section>

      <section
        id="about"
        className={styles.about}
        aria-labelledby="about-heading"
      >
        <div className="u-container">
          <p className="meta">03 / About</p>
          <h2 id="about-heading" className={styles.sectionTitle}>
            About
          </h2>
          <p>{site.person.shortBio}</p>
        </div>
      </section>

      <section
        id="contact"
        className={styles.contact}
        aria-labelledby="contact-heading"
      >
        <div className="u-container">
          <p className="meta">04 / Contact</p>
          <h2 id="contact-heading" className={styles.sectionTitle}>
            Contact
          </h2>
          <p>
            Prefer LinkedIn or GitHub for now. A dedicated contact path lands
            when the contact method is decided.
          </p>
        </div>
      </section>
    </div>
  )
}
