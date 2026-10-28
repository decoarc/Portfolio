import type { SiteContent } from '../types.ts'

/**
 * Copy do site em inglês.
 * Hero, `work` e `projectType` vêm da Fase 0;
 * `about`, contato, 404 e rótulos do case study vêm do site anterior (main).
 * Sem e-mail (não há e-mail verificado), sem empregador, métrica ou prêmio.
 */
export const siteEn: SiteContent = {
  meta: {
    homeTitle: 'André Arcodaci — Full Stack Developer',
    titleSuffix: ' — André Arcodaci',
    // Revisar na Fase 5 com o conteúdo real
    description:
      'Portfolio of André Arcodaci, a full stack developer in Brazil: interfaces, APIs and automation, with case studies of verified work.',
    ogImageAlt: 'André Arcodaci — Full Stack Developer, portfolio',
  },
  shell: {
    skipToContent: 'Skip to content',
    homeMark: 'André Arcodaci',
    localeSwitch: 'Português',
    footerNote: 'André Arcodaci — Full Stack Developer',
  },
  person: {
    name: 'André Arcodaci',
    role: 'Full Stack Developer',
    location: 'Based in Brazil',
  },
  hero: {
    statement:
      'I build interfaces, APIs and automation — systems you can run, read and reason about.',
    ctaPrimary: 'Selected work',
    ctaSecondary: 'Get in touch',
    metaLeft: 'BR · Remote',
    metaRight: 'Portfolio 2026',
  },
  release: {
    label: 'Contents',
    entries: {
      work: 'Selected work',
      approach: 'Approach',
      about: 'About',
      interests: 'Interests',
      contact: 'Contact',
    },
  },
  projectType: {
    verified: 'Verified',
    concept: 'Concept study',
  },
  links: {
    labels: { live: 'Live demo', repo: 'Repository' },
    externalHint: 'opens in a new tab',
  },
  work: {
    label: 'Selected work',
    intro:
      'Each entry is honest about what it is: verified work, or a concept study.',
    previewNote: 'Case study soon',
    noCapture: 'no capture',
  },
  approach: {
    label: 'Approach',
    intro: 'How I tend to work, whatever the stack.',
    // Sem copy real de abordagem ainda: os três itens são mock.
    items: [
      {
        title: 'Read the system first',
        body: 'Before changing anything, I trace how data enters, where it is stored and who depends on it. Most surprises live in the seams.',
        mock: true,
      },
      {
        title: 'Small, checkable steps',
        body: 'I prefer changes that can be reviewed in one sitting and confirmed by a test or a command over large rewrites that are hard to follow.',
        mock: true,
      },
      {
        title: 'Write down the decision',
        body: 'Trade-offs go into a short note next to the code, so the next person knows why it is this way and what would justify changing it.',
        mock: true,
      },
    ],
  },
  about: {
    label: 'About',
    lead: 'I’m a full stack developer based in Brazil, building software where interfaces meet data and automation.',
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
  },
  interests: {
    label: 'Interests',
    items: ['Games', 'Drawing', 'Reading', 'Traveling'],
  },
  contact: {
    label: 'Contact',
    lead: 'Open to roles, collaborations, and sharp technical conversations.',
    channels: [
      {
        id: 'github',
        label: 'GitHub',
        href: 'https://github.com/decoarc',
        peek: {
          mark: 'GH',
          note: 'Profile and repositories · opens in a new tab',
        },
      },
      {
        id: 'linkedin',
        label: 'LinkedIn',
        href: 'https://linkedin.com/in/andrearcodaci',
        peek: { mark: 'in', note: 'Professional profile · opens in a new tab' },
      },
    ],
  },
  caseStudy: {
    backToWork: 'Back to selected work',
    roleLabel: 'Role',
    yearLabel: 'Period',
    stackLabel: 'Stack',
    linksLabel: 'Links',
    previewNotice:
      'A technical overview based on verified implementation details. Full case study in progress.',
    conceptNotice:
      'Concept study — an exploration of how I would approach the problem. Not shipped work: no users, no production results.',
  },
  notFound: {
    title: 'Page not found',
    body: 'That route is not available. The project may be unpublished, incomplete, or the address may be mistyped.',
    homeLabel: 'Back to home',
  },
}
