export type CompLocale = 'en' | 'pt'

export interface CompProject {
  slug: string
  title: string
  year: string
  /** Rótulo visível de natureza do trabalho. */
  type: string
  summary: string
  stack: string
}

export interface CompCopy {
  person: {
    name: string
    role: string
    location: string
  }
  hero: {
    statement: string
    ctaPrimary: string
    ctaSecondary: string
    metaLeft: string
    metaRight: string
  }
  work: {
    label: string
    intro: string
  }
  projects: CompProject[]
}

/**
 * Copy mock da Fase 0, compartilhada pelos três comps para que a comparação
 * isole a composição. Só `map-areas` corresponde a trabalho real; os demais
 * existem para exercitar a lista e serão substituídos na Fase 2.
 */
export const content: Record<CompLocale, CompCopy> = {
  en: {
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
    work: {
      label: 'Selected work',
      intro:
        'Four entries, honest about what they are: one shipped, three studies.',
    },
    projects: [
      {
        slug: 'map-areas',
        title: 'Map Areas',
        year: '2025',
        type: 'Verified',
        summary:
          'Geospatial area management for field teams, built to stay usable when the connection is not.',
        stack: 'React · TypeScript · PostGIS',
      },
      {
        slug: 'token-killer',
        title: 'Token Killer',
        year: '2026',
        type: 'Concept study',
        summary:
          'A command-line proxy that compresses tool output before it ever reaches a model.',
        stack: 'Rust · Tokio',
      },
      {
        slug: 'atlas-ledger',
        title: 'Atlas Ledger',
        year: '2025',
        type: 'Concept study',
        summary:
          'Double-entry bookkeeping primitives over an append-only event log you can audit by hand.',
        stack: 'Go · PostgreSQL',
      },
      {
        slug: 'field-notes',
        title: 'Field Notes',
        year: '2024',
        type: 'Concept study',
        summary:
          'Offline-first capture that reconciles conflicting edits without a server round trip.',
        stack: 'TypeScript · CRDT',
      },
    ],
  },
  pt: {
    person: {
      name: 'André Arcodaci',
      role: 'Desenvolvedor Full Stack',
      location: 'No Brasil',
    },
    hero: {
      statement:
        'Construo interfaces, APIs e automação — sistemas que você consegue rodar, ler e entender.',
      ctaPrimary: 'Trabalhos selecionados',
      ctaSecondary: 'Entrar em contato',
      metaLeft: 'BR · Remoto',
      metaRight: 'Portfólio 2026',
    },
    work: {
      label: 'Trabalhos selecionados',
      intro:
        'Quatro entradas, honestas sobre o que são: uma entregue, três estudos.',
    },
    projects: [
      {
        slug: 'map-areas',
        title: 'Map Areas',
        year: '2025',
        type: 'Verificado',
        summary:
          'Gestão de áreas geoespaciais para equipes de campo, feita para continuar usável quando a conexão não está.',
        stack: 'React · TypeScript · PostGIS',
      },
      {
        slug: 'token-killer',
        title: 'Token Killer',
        year: '2026',
        type: 'Estudo conceitual',
        summary:
          'Um proxy de linha de comando que comprime a saída das ferramentas antes de ela chegar ao modelo.',
        stack: 'Rust · Tokio',
      },
      {
        slug: 'atlas-ledger',
        title: 'Atlas Ledger',
        year: '2025',
        type: 'Estudo conceitual',
        summary:
          'Primitivas de partidas dobradas sobre um log de eventos append-only que dá para auditar na mão.',
        stack: 'Go · PostgreSQL',
      },
      {
        slug: 'field-notes',
        title: 'Field Notes',
        year: '2024',
        type: 'Estudo conceitual',
        summary:
          'Captura offline-first que reconcilia edições conflitantes sem ida e volta ao servidor.',
        stack: 'TypeScript · CRDT',
      },
    ],
  },
}
