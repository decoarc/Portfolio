import type { Project } from '../../types.ts'

/**
 * The Abyss — dados do código e do SPEC.md de decoarc/THE-ABYSS (2026-11-21)
 * e do site no ar. A página pública ainda se rotula "demonstração visual";
 * o case não promete mais do que o código faz.
 */
export const theAbyss: Project = {
  slug: 'the-abyss',
  title: 'The Abyss',
  type: 'verified',
  status: 'published',
  summary:
    'A shared, persistent deep-sea ecosystem in the browser: luminous organisms move, feed, reproduce and mutate in a world simulated on the server, and each visitor can introduce one species of their own.',
  role: 'Design and development',
  year: '2026',
  stack: [
    'Elixir',
    'Phoenix',
    'PostgreSQL',
    'Three.js',
    'React Three Fiber',
    'Docker',
  ],
  cover: {
    src: '/images/projects/the-abyss.webp',
    alt: 'The Abyss — translucent, glowing organisms drifting over a dark blue-green seabed, with a species search box and a “Create species” button',
    width: 1200,
    height: 750,
    thumbSrc: '/images/projects/the-abyss-800.webp',
  },
  sections: [
    {
      heading: 'Problem and motivation',
      paragraphs: [
        'The Abyss is an artificial-life observatory: one world, the same for everyone who opens the page, where autonomous organisms live, compete and sometimes go extinct. Visitors watch rather than command; the only intervention allowed is introducing a species.',
        'It is an exploratory personal project. Demand is unvalidated, and it is not meant to be a biologically accurate simulator.',
      ],
    },
    {
      heading: 'Role and contributions',
      items: [
        'Wrote the specification, with a visual quality gate before any simulation work: art direction came first.',
        'Built the 3D scene in React Three Fiber: seabed, flora, particles at several depths, organisms and post-processing.',
        'Built the simulation server in Elixir and Phoenix: the world runs on the server and reaches the browser over WebSocket channels.',
        'Built species creation: a blueprint with attributes, a feeding strategy and traits, published once per e-mail address after a verification link.',
        'Set up production on a VPS with Docker Compose, Caddy and a Cloudflare Tunnel, with automatic deploys of the main branch and scheduled database backups.',
      ],
    },
    {
      heading: 'Engineering decisions',
      items: [
        'Server-authoritative world: the browser only renders what the server sends, so every visitor sees the same ecosystem.',
        'A pure, deterministic simulation core (no processes, no global random state), with spatial grids for neighbor searches.',
        'A snapshot of the world every minute and on shutdown; on restart, the world comes back from the snapshot and is reconciled with the database.',
        'E-mail only, no password or account: a short-lived link verifies the address, with rate limiting on submissions.',
      ],
    },
    {
      heading: 'Technical challenges',
      items: [
        'Letting new species emerge: groups of organisms whose inherited mutations drift far enough from the parent blueprint branch into subspecies.',
        'Keeping history: deaths and extinctions are stored with their cause, including the predator, and each species has a tree of branches and extinctions.',
        'Keeping a public, always-on world within the budget of a single VPS, with end-to-end tests for restarts, crashes and long stops.',
      ],
    },
    {
      heading: 'Results and current status',
      items: [
        'Live at theabyss.andrearcodaci.com: organisms you can search for, with the camera taking you to them, and species creation with real verification e-mails.',
        'The interface is in Portuguese, and the page still shows a “visual demonstration” label while the ecosystem is being tuned.',
      ],
    },
  ],
  links: [
    { kind: 'live', href: 'https://theabyss.andrearcodaci.com/' },
    { kind: 'repo', href: 'https://github.com/decoarc/THE-ABYSS' },
  ],
}
