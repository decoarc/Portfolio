import type { Project } from '../../types.ts'

/** Estudo conceitual inventado para exercitar o layout. Bloqueia `pnpm build`. */
export const fieldNotes: Project = {
  slug: 'field-notes',
  title: 'Field Notes',
  type: 'concept',
  status: 'published',
  mock: true,
  summary:
    'Offline-first capture that reconciles conflicting edits without a server round trip.',
  role: 'Author',
  year: '2024',
  stack: ['TypeScript', 'CRDT'],
  sections: [
    {
      heading: 'The question',
      paragraphs: [
        'Notes taken in the field are often written where the connection drops. If two people edit the same note offline, someone’s work usually gets overwritten when they sync.',
        'The study looks at whether a conflict-free data type can merge those edits on each device, so that syncing becomes an exchange of changes rather than a contest.',
      ],
    },
    {
      heading: 'Approach',
      items: [
        'Each note is a text CRDT stored locally; edits are recorded as operations, not as full snapshots.',
        'Devices exchange missing operations when they meet a network, in any order.',
        'The interface never waits for a server to show a saved state.',
      ],
    },
    {
      heading: 'Trade-offs',
      items: [
        'A merge that is always valid is not always what a person meant; some conflicts still need a visible note to the reader.',
        'Operation history grows over time, so it needs a compaction story before it is practical.',
      ],
    },
  ],
  links: [],
}
