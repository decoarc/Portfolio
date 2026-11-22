import type { Project } from '../../types.ts'

/**
 * The Abyss — dados do código e do SPEC.md de decoarc/THE-ABYSS (2026-11-21)
 * e do site no ar; texto do case reescrito a partir do rascunho do dono
 * (2026-11-22), no formato das cinco seções dos outros cases. A página pública ainda se rotula "demonstração visual";
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
        'The Abyss grew out of the cell stage of Spore: the freedom to build a creature by combining parts and to watch how each choice weighs on its survival. Here the perspective shifts: instead of controlling an organism, the visitor is creator and observer.',
        'There is only one world, the same for everyone who opens the page. A species introduced by one person competes with other people’s, gives rise to new lineages or disappears. The goal was to combine procedural creation, artificial life and a contemplative visual experience with an architecture able to keep that world running non-stop.',
      ],
    },
    {
      heading: 'Role and contributions',
      items: [
        'Built the species editor: 10 component types (feeding, movement, senses, behavior and defense), assembled on a 24-point budget, with a procedural 3D preview of the creature before publishing.',
        'Built the simulation server in Elixir, Phoenix and OTP: a central process holds and updates the world, and changes reach visitors in real time over Phoenix Channels and WebSockets.',
        'Built the 3D scene in React, Three.js and React Three Fiber: the environment, organism animation, lighting and bioluminescence.',
        'Modeled persistence in PostgreSQL with Ecto: creators, species, genetic configurations, evolutionary branches, events and extinctions.',
        'Set up production on a VPS with Docker Compose, Caddy and Cloudflare Tunnel, with deploys from the main branch, health checks and scheduled backups.',
      ],
      figures: [
        {
          src: '/images/projects/the-abyss-editor.webp',
          alt: 'The Abyss species editor: on the left, colors and pattern, what the creature does and a budget of 20 of 24 points; on the right, the 3D preview of a creature with a mandible, a flagellum, two ocelli, a plate and cilia',
          caption:
            'The species editor: parts change what the creature does, within a 24-point budget. The interface is in Portuguese.',
          width: 1200,
          height: 800,
        },
      ],
    },
    {
      heading: 'Engineering decisions',
      items: [
        'Server-authoritative world: the ecological logic runs there and the browser only presents what it receives, so every visitor sees the same ecosystem.',
        'A deterministic simulation core with a fixed time step, so behavior can be reproduced from controlled initial conditions; spatial grids speed up neighbor searches for feeding and predation.',
        'Choices with a cost: each component changes how the species behaves, and the 24-point budget forces trade-offs between speed, perception, defense and energy use.',
        'Periodic, versioned snapshots of the world, with SHA-256 checksums and stored in PostgreSQL, instead of writing every movement; on restart, the server loads the latest valid version and reconciles it with the records.',
        'One published species per verified e-mail address, enforced by a constraint in the database itself. After verification, three founder organisms enter the world and the creator controls nothing more.',
      ],
    },
    {
      heading: 'Technical challenges',
      items: [
        'Letting new lineages emerge: offspring inherit components that were added, removed or swapped, and when those differences persist and meet certain criteria, the population becomes a new branch with its own identity in the family tree.',
        'Keeping history: extinction causes, the predators involved and deaths per period feed the species search and the lineage tree, living and extinct.',
        'Balancing the simulation’s complexity against the resources of a single VPS, keeping the world consistent across visitors without weighing on rendering.',
        'Load tests with 250 organisms and 50 simultaneous observers, plus restarts, snapshot recovery, lineage continuity and data integrity.',
      ],
    },
    {
      heading: 'Results and current status',
      items: [
        'Live at theabyss.andrearcodaci.com: an artificial-life observatory that brings frontend, backend, data modeling, real time and infrastructure together in one experience.',
        'Still evolving, especially in ecological balance and behavior. It does not aim for biological accuracy, but to see how simple rules produce unexpected interactions and stories.',
        'The interface is in Portuguese, and the page still shows a “visual demonstration” label while the ecosystem is being tuned.',
      ],
    },
  ],
  links: [
    { kind: 'live', href: 'https://theabyss.andrearcodaci.com/' },
    { kind: 'repo', href: 'https://github.com/decoarc/THE-ABYSS' },
  ],
}
