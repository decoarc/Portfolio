import type { SiteContent } from '../types'

/**
 * Verified English site shell copy.
 * Sources: design brief + legacy prototype (name, role, social URLs, POV, stack interests).
 * Do not invent employers, metrics, awards, or email addresses here.
 */
export const siteEn: SiteContent = {
  person: {
    name: 'André Arcodaci',
    role: 'Full Stack Developer',
    locationLabel: 'Based in Brazil',
    shortBio:
      'Software engineering for interfaces, APIs, and automation — with a focus on developer tools and systems you can run and reason about.',
  },
  social: [
    {
      id: 'github',
      label: 'GitHub',
      href: 'https://github.com/decoarc',
      professionalDefault: true,
    },
    {
      id: 'linkedin',
      label: 'LinkedIn',
      href: 'https://linkedin.com/in/andrearcodaci',
      professionalDefault: true,
    },
    {
      id: 'instagram',
      label: 'Instagram',
      href: 'https://instagram.com/arcowill',
      professionalDefault: false,
    },
  ],
  nav: [
    { label: 'Work', href: '#work' },
    { label: 'About', href: '#about' },
    { label: 'Contact', href: '#contact' },
  ],
  hero: {
    ctaPrimary: { label: 'Selected work', href: '#work' },
    ctaSecondary: { label: 'Contact', href: '#contact' },
    plateAnnotation: 'BR · Web',
    plateFocusLabel: 'Focus',
    plateFocus: ['Interfaces', 'APIs & automation', 'Developer tools'],
  },
  work: {
    title: 'Selected work',
    intro:
      'Projects with honest scope. Live demos ship when ready; case studies follow when the evidence is complete.',
    liveDemoLabel: 'Live demo',
    caseStudySoonLabel: 'Case study soon',
    caseStudyLabel: 'Case study',
    previewStatusNote: 'Preview',
    moreSoonNote:
      'Additional projects will join this list as they are ready to show.',
  },
  about: {
    title: 'About',
    lead:
      'I’m a full stack developer based in Brazil, building software where interfaces meet data and automation.',
    body: 'I care about clear systems: APIs you can trust, UIs that stay understandable, and tooling that helps developers move with confidence. Interests span web stacks, architecture, desktop apps, graphics programming, and local AI–assisted developer tools — always grounded in real delivery, not résumé theater.',
    stackLabel: 'Working with',
    stack: [
      'PHP',
      'JavaScript',
      'TypeScript',
      'React',
      'REST APIs',
      'MySQL',
      'Git',
      'Docker',
    ],
    exploringLabel: 'Exploring',
    exploring: [
      'Software architecture',
      'Desktop applications',
      'Graphics programming',
      'Local AI / developer tools',
    ],
  },
  contact: {
    title: 'Contact',
    lead: 'Open to roles, collaborations, and sharp technical conversations.',
    note: 'LinkedIn and GitHub are the best ways to reach me.',
  },
  shell: {
    skipToContent: 'Skip to content',
    homeLandmark: 'Home',
    footerNote: 'André Arcodaci — Full Stack Developer',
  },
}
