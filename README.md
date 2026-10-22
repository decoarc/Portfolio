# Portfolio — André Arcodaci

Greenfield craft portfolio (Vite + React + TypeScript). Visual direction: **Ledger × Datum × Cut** hybrid. Planning docs live in `docs/`.

## Workspace boundaries

| Path | Access |
|------|--------|
| `Portfolio/` (this repo) | Writable |
| sibling `prototype/` | **Read-only** — do not modify or commit there |

## Prerequisites

- Node.js ≥ 20
- pnpm 10 (`corepack enable` recommended)

## Commands

```bash
pnpm install
pnpm dev          # local dev server
pnpm typecheck    # TypeScript project references
pnpm lint         # ESLint
pnpm format       # Prettier write
pnpm format:check
pnpm test         # Vitest (run once)
pnpm test:watch
pnpm build        # production build to dist/
pnpm preview      # preview production build
pnpm validate     # typecheck + lint + test + build
```

## Stack (M1)

| Package | Why | Milestone |
|---------|-----|-----------|
| `react`, `react-dom` | UI | M1 |
| `vite`, `@vitejs/plugin-react` | Dev/build | M1 |
| `typescript` (strict) | Typed content + app | M1 |
| `eslint` + plugins | Lint / a11y hints | M1 |
| `prettier` | Formatting | M1 |
| `vitest`, Testing Library, `jsdom` | Unit/component tests | M1 |
| `@fontsource-variable/bricolage-grotesque` | Ledger display face (self-hosted via package) | M1 |
| `@fontsource-variable/source-sans-3` | Body face | M1 |
| `@fontsource/ibm-plex-mono` | Datum metadata only | M1 |

### Explicitly not installed (yet / ever by default)

| Package | Status |
|---------|--------|
| `react-router` | Deferred until hosting + SPA fallback (Gate D); home shell only |
| `gsap` | M3 if CSS cannot meet kept motion experiments |
| `lenis`, `three` | Not by default — needs explicit approval |
| Tailwind | Rejected — CSS Modules + tokens |

## Content rules

- English copy lives under `src/content/en/` — components must not hardcode user-facing strings.
- Projects require `status`: `draft` \| `preview` \| `published`.
- Public UI must use `getProjectHref` / `canLinkCaseStudy` so unpublished work never links to `/work/:slug`.
- Do not invent employers, metrics, or awards. Use labeled `[… TBD]` placeholders.

## Design tokens

Provisional tokens in `src/styles/tokens.css` (paper/ink, accent, type, space, motion). Palette/type finalize at Gate B (browser-rendered first viewport).

## Asset provenance

| Asset | Source | Notes |
|-------|--------|-------|
| `public/images/projects/map-areas.webp` (+ `-800.webp`) | Read-only copy from `prototype/public/assets/components/Projects/map-areas.png` | Optimized with `cwebp` (q80); prototype/ not modified |

## Milestone status

- **M1** — Project foundation & design system — complete
- **M2a** — First-viewport visual prototype — complete (Gate B approved)
- **M2b** — Full static homepage — complete (Gate C approved)
- **M3** — Motion & interactions — complete (approved)
- **M4a** — Project inventory & case-study evidence — delivered (`docs/m4a/`; awaiting approval)
- **M4b** — Case-study routes & pages — not started (needs M4a + Gate D)
- **Gates D/E** — Hosting/SPA fallback and publishable Map Areas evidence — open (see `docs/m4a/`)
