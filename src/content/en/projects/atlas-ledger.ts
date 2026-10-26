import type { Project } from '../../types.ts'

/** Estudo conceitual inventado para exercitar o layout. Bloqueia `pnpm build`. */
export const atlasLedger: Project = {
  slug: 'atlas-ledger',
  title: 'Atlas Ledger',
  type: 'concept',
  status: 'published',
  mock: true,
  summary:
    'Double-entry bookkeeping primitives over an append-only event log you can audit by hand.',
  role: 'Author',
  year: '2025',
  stack: ['Go', 'PostgreSQL'],
  sections: [
    {
      heading: 'The question',
      paragraphs: [
        'Small teams often keep money in a single balance column that is updated in place. When a figure looks wrong, there is no trail to explain how it got there.',
        'The study explores how little machinery is needed to keep every movement as an entry that can be replayed and checked by a person with a spreadsheet.',
      ],
    },
    {
      heading: 'Primitives',
      items: [
        'Accounts, entries and transactions; a transaction is accepted only when its debits and credits balance.',
        'Entries are never edited or deleted. A correction is a new transaction that reverses the old one.',
        'Balances are derived by replaying the log, and cached only as a projection that can be rebuilt.',
      ],
    },
    {
      heading: 'Storage',
      paragraphs: [
        'The log lives in a single PostgreSQL table with insert-only permissions for the application role. Constraints in the database, not only in the service, reject an unbalanced transaction.',
      ],
    },
    {
      heading: 'Open questions',
      items: [
        'How to handle currencies without hiding conversion inside an entry.',
        'Where to draw the line between the ledger and the business rules that create transactions.',
      ],
    },
  ],
  links: [],
}
