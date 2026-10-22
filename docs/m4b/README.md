# M4b — Case-Study Routes & Template

**Status:** **Completed** (approved 2026-10-22)  
**Depends on:** M4a evidence pack, Gate D (Cloudflare Pages locked)  
**Does not complete:** Gate E (Map Areas stays `preview` / `evidenceComplete: false`)

See [M4B_COMPLETION.md](./M4B_COMPLETION.md) for the closure report.

---

## 1. Delivered

| Work item | Status |
|-----------|--------|
| `react-router` routes `/`, `/work/:slug`, `*` | Done |
| Cloudflare SPA fallback `public/_redirects` | Done |
| Local preview SPA fallback (`vite-spa-fallback.ts`) | Done — verifies hard refresh without deploy |
| Case-study editorial template + visual refinement | Done |
| Labeled preview for incomplete projects | Done (Map Areas) |
| Publication-safe homepage CTAs | Done (`getProjectHref` unchanged) |
| Scroll + focus management | Done |
| Unit + integration + Playwright E2E | Done |
| Review screenshots | `docs/m4b-review/` |

---

## 2. Hosting assumptions (locked)

| Setting | Value |
|---------|-------|
| Host | Cloudflare Pages |
| Build | `pnpm build` |
| Output | `dist` |
| `base` | `/` |
| SPA rule | `/* /index.html 200` in `public/_redirects` |

Do **not** connect Cloudflare or deploy until André asks.

---

## 3. Publication rules (unchanged)

- Homepage case-study CTA only when `published` **and** `evidenceComplete`.
- Direct `/work/:slug` for `preview` → labeled **preview** page (verified facts only; TBD sections omitted).
- Unknown / draft / published-without-evidence → in-app **Page not found**.
- Map Areas remains `preview` + `evidenceComplete: false`.

---

## 4. Commands

```bash
pnpm validate          # typecheck, lint, unit, build, e2e
pnpm test:e2e          # Playwright against vite preview
pnpm preview           # after build; deep links work via SPA plugin
```

---

## 5. Next (not started)

- Gate E narrative fill / Map Areas `published`
- Cloudflare Pages connect + production deep-link verify
- M5 polish expansion
