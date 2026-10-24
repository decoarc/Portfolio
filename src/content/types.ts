export type Locale = 'en' | 'pt'

/** Controls public visibility and link generation during intermediate milestones. */
export type ProjectStatus = 'draft' | 'preview' | 'published'

export interface SitePerson {
  name: string
  role: string
  locationLabel: string
  shortBio: string
  email?: string
}

export interface SocialLink {
  id: 'github' | 'linkedin' | 'instagram' | (string & {})
  label: string
  href: string
  /** When false, omit from primary professional chrome by default. */
  professionalDefault?: boolean
}

export interface NavItem {
  label: string
  href: string
}

export interface SiteCta {
  label: string
  href: string
}

export interface SiteContent {
  person: SitePerson
  social: SocialLink[]
  nav: NavItem[]
  hero: {
    ctaPrimary: SiteCta
    ctaSecondary: SiteCta
    /** Quiet Datum annotation on the Cut plate — not a badge cluster. */
    plateAnnotation: string
    /** Title-block focus lines (interests from brief — not proficiency claims). */
    plateFocusLabel: string
    plateFocus: string[]
  }
  work: {
    title: string
    intro: string
    liveDemoLabel: string
    caseStudySoonLabel: string
    caseStudyLabel: string
    previewStatusNote: string
    moreSoonNote: string
  }
  caseStudy: {
    backToWorkLabel: string
    backToHomeLabel: string
    previewBanner: string
    previewNote: string
    overviewLabel: string
    problemLabel: string
    responsibilitiesLabel: string
    technologiesLabel: string
    implementationLabel: string
    challengesLabel: string
    outcomesLabel: string
    mediaLabel: string
    repoLabel: string
    liveDemoLabel: string
    yearLabel: string
  }
  notFound: {
    title: string
    body: string
    homeLabel: string
  }
  about: {
    title: string
    lead: string
    body: string
    stackLabel: string
    stack: string[]
    exploringLabel: string
    exploring: string[]
  }
  contact: {
    title: string
    lead: string
    /** Optional supporting line — omit development/placeholder phrasing. */
    note?: string
    /** Visible hint on outbound channels; also appended to the accessible name. */
    externalHint: string
  }
  shell: {
    skipToContent: string
    homeLandmark: string
    footerNote: string
  }
}

export interface MediaAsset {
  src: string
  alt: string
  width: number
  height: number
}

export interface ProjectSummary {
  slug: string
  title: string
  tagline: string
  stack: string[]
  /**
   * Single calendar year when work fits one year.
   * Prefer `period` for inclusive spans such as 2025–2026.
   */
  year?: number
  /** Inclusive display span (e.g. "2025–2026"). Takes precedence over `year`. */
  period?: string
  status: ProjectStatus
  coverImage: MediaAsset
  featured: boolean
  hrefLive?: string
  hrefRepo?: string
}

export interface ProjectCaseStudy extends ProjectSummary {
  problem: string
  responsibilities: string[]
  implementation: string[]
  challenges: string[]
  /** Use "[Outcome TBD]" when unknown — never invent metrics. */
  outcomes: string[]
  gallery?: MediaAsset[]
  /** Case study ships only when evidence is real enough. */
  evidenceComplete: boolean
}
