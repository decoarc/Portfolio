import type { Project } from '../../types.ts'

/** Estudo conceitual inventado para exercitar o layout. Bloqueia `pnpm build`. */
export const tokenKiller: Project = {
  slug: 'token-killer',
  title: 'Token Killer',
  type: 'concept',
  status: 'published',
  mock: true,
  summary:
    'A command-line proxy that compresses tool output before it ever reaches a model.',
  role: 'Author',
  year: '2026',
  stack: ['Rust', 'Tokio'],
  sections: [
    {
      heading: 'The question',
      paragraphs: [
        'Coding agents read the raw output of builds, tests and version control. Most of it is noise the model has to wade through before it reaches the one line that matters.',
        'The study asks whether a thin proxy, sitting between the agent and the shell, can keep the signal and drop the rest without hiding anything the agent needs.',
      ],
    },
    {
      heading: 'Shape of the design',
      items: [
        'One filter per tool, chosen by the command name, with a pass-through for anything unknown.',
        'Filters group repeated lines and keep errors verbatim, so nothing that explains a failure is rewritten.',
        'The original output stays one flag away, for when a filtered summary looks wrong.',
      ],
    },
    {
      heading: 'Risks worth naming',
      items: [
        'A filter that reads only standard output can report success while the tool failed on standard error.',
        'Exit codes must pass through untouched; a summary line is never the source of truth.',
      ],
    },
  ],
  links: [],
}
