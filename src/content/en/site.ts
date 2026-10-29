import type { SiteContent } from '../types.ts'

/**
 * Copy do site em inglês.
 * Hero, `work` e `projectType` vêm da Fase 0;
 * `about`, contato, 404 e rótulos do case study vêm do site anterior (main).
 * Sem e-mail (não há e-mail verificado), sem métrica ou prêmio. A trajetória
 * (empregador, formação) usa os dados que o dono passou em 2026-10-28.
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
      'I build software driven by curiosity, shaped by engineering, and refined through iteration.',
    ctaPrimary: 'Personal projects',
    ctaSecondary: 'Get in touch',
    metaLeft: 'BR · Remote',
    metaRight: 'Portfolio 2026',
  },
  release: {
    label: 'Contents',
    entries: {
      trajectory: 'Trajectory',
      tools: 'Tools',
      work: 'Personal projects',
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
  // Dados do LinkedIn e da lista de ferramentas do dono (2026-10-28).
  trajectory: {
    label: 'Trajectory',
    intro: 'From mechanical engineering to software development.',
    experienceLabel: 'Experience',
    educationLabel: 'Education',
    experience: [
      {
        period: 'Oct 2025 — present',
        start: '2025-10',
        current: true,
        mode: 'Remote',
        role: 'Software Developer',
        company: 'Witek',
        contract: 'Full-time',
        summary:
          'Full stack development for the real estate and property registry sector, nationwide: new features, improvements, fixes and optimization of critical services used by notary offices.',
        tech: ['PHP', 'JavaScript', 'MySQL', 'Git', 'Docker', 'Scrum', 'Azure'],
      },
    ],
    education: [
      {
        period: '2023 — 2024',
        course:
          'Postgraduate specialization, Reliability Engineering and Asset Management',
        institution: 'PUC Minas',
      },
      {
        period: '2015 — 2022',
        course: "Bachelor's degree in Mechanical Engineering",
        institution: 'Universidade Salvador',
      },
    ],
  },
  tools: {
    label: 'Tools',
    groups: [
      {
        name: 'Frontend',
        items: [
          'JavaScript',
          'TypeScript',
          'React',
          'Next.js',
          'Tailwind CSS',
          'Material UI',
          'Vite',
        ],
      },
      {
        name: 'Backend',
        items: ['Node.js', 'Express', 'Python', 'PHP', 'REST APIs'],
      },
      {
        name: 'Databases',
        items: ['MySQL', 'PostgreSQL', 'SQLite', 'MongoDB'],
      },
      {
        name: 'Cloud, DevOps & Delivery',
        items: ['GCP', 'Azure', 'Docker', 'Git'],
      },
      { name: 'Desktop & Systems', items: ['Rust', 'Tauri', 'C++', 'C#'] },
    ],
  },
  work: {
    label: 'Personal projects',
    intro: 'Verified work or concept study.',
    previewNote: 'Case study soon',
    noCapture: 'no capture',
  },
  approach: {
    label: 'Approach',
    intro: 'How I tend to work, whatever the stack.',
    items: [
      {
        title: 'Look beneath the surface',
        body: 'I like to understand how things work beneath the surface. Whether exploring an existing system or starting something new, I look at its structure, dependencies, and the reasoning behind its design.',
      },
      {
        title: 'Iterate in focused steps',
        body: 'I approach development as an iterative process. I prefer testing ideas, making focused changes, and learning from the results rather than committing to complex solutions too early.',
      },
      {
        title: 'Weigh the trade-offs',
        body: 'Every technical decision involves trade-offs. I value clear reasoning, maintainable code, and documenting important choices so that solutions remain understandable and can evolve over time.',
      },
    ],
  },
  about: {
    label: 'About',
    lead: 'I’m a full stack developer based in Brazil, building software where interfaces meet data and automation.',
    body: 'I care about clear systems: APIs you can trust, UIs that stay understandable, and tooling that helps developers move with confidence. Interests span web stacks, architecture, desktop apps, graphics programming, and local AI–assisted developer tools, always grounded in real delivery and not résumé theater.',
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
    backToWork: 'Back to personal projects',
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
