export type Locale = 'en' | 'pt'
export type ProjectType = 'verified' | 'concept'
export type ProjectStatus = 'draft' | 'preview' | 'published'
export type ProjectLinkKind = 'live' | 'repo'
export type HomeSectionId =
  'work' | 'approach' | 'about' | 'interests' | 'contact'

export interface ProjectLink {
  kind: ProjectLinkKind
  href: string
}
export interface ProjectCover {
  src: string
  alt: string
  width: number
  height: number
  /** Miniatura 800×600, mesma proporção 4:3 da capa. */
  thumbSrc?: string
}
/** Ao menos um de `paragraphs`/`items` é não vazio. */
export interface CaseSection {
  heading: string
  paragraphs?: string[]
  items?: string[]
}

export interface Project {
  slug: string
  title: string
  type: ProjectType
  status: ProjectStatus
  /** Dado inventado para exercitar layout. Bloqueia `pnpm build`. */
  mock?: true
  summary: string
  role: string
  /** Texto livre: '2025' ou '2025–2026'. */
  year: string
  stack: string[]
  cover?: ProjectCover
  sections: CaseSection[]
  links: ProjectLink[]
}

export interface ApproachItem {
  title: string
  body: string
  mock?: true
}
export interface ContactChannel {
  id: 'github' | 'linkedin'
  label: string
  href: string
  peek: { mark: string; note: string }
}

export interface SiteContent {
  meta: {
    homeTitle: string
    titleSuffix: string
    description: string
    ogImageAlt: string
  }
  shell: {
    skipToContent: string
    homeMark: string
    /** Nome do *outro* idioma, escrito nele: 'Português' no site EN, 'English' no PT. */
    localeSwitch: string
    footerNote: string
  }
  person: { name: string; role: string; location: string }
  hero: {
    statement: string
    ctaPrimary: string
    ctaSecondary: string
    metaLeft: string
    metaRight: string
  }
  release: { label: string; entries: Record<HomeSectionId, string> }
  projectType: Record<ProjectType, string>
  links: { labels: Record<ProjectLinkKind, string>; externalHint: string }
  work: { label: string; intro: string; previewNote: string; noCapture: string }
  approach: { label: string; intro: string; items: ApproachItem[] }
  about: {
    label: string
    lead: string
    body: string
    stackLabel: string
    stack: string[]
  }
  interests: { label: string; items: string[] }
  contact: { label: string; lead: string; channels: ContactChannel[] }
  caseStudy: {
    backToWork: string
    roleLabel: string
    yearLabel: string
    stackLabel: string
    linksLabel: string
    previewNotice: string
    conceptNotice: string
  }
  notFound: { title: string; body: string; homeLabel: string }
}

export interface LocaleContent {
  site: SiteContent
  projects: Project[]
}
