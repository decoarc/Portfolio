# M4b Completion Report

**Date:** 2026-10-22  
**Status:** **Completed and approved**  
**Validate (final):** `pnpm validate` — typecheck, lint (0 errors), 23 unit tests, production build, 11 Playwright E2E — **passed**

---

## 1. Routing architecture

- `createBrowserRouter` + `createAppRoutes()` in `src/app/router.tsx`
- Route elements in `src/app/routeElements.tsx`
- Access resolution: `resolveCaseStudyAccess` in `src/content/caseStudyAccess.ts`

| Path | Behavior |
|------|----------|
| `/` | Homepage (unchanged composition) |
| `/work/:slug` | Full case study, labeled preview, or soft-404 |
| `/work` | Redirect → `/#work` |
| `*` | Branded not-found |

SPA fallback: `public/_redirects` (Cloudflare) + `vite-spa-fallback.ts` (local `pnpm preview`).

---

## 2. Case-study template

`src/pages/CaseStudyPage/` — editorial layout (Ledger + Datum + Cut; no card grid). Preview mode strips TBD placeholders and leads with verified overview + authentic project screenshot.

---

## 3. Publication safety

Map Areas: `status: 'preview'`, `evidenceComplete: false`. Homepage shows “Case study soon”; `/work/map-areas` is explicitly labeled project preview.

---

## 4. Screenshots

Under `docs/m4b-review/`: preview at 390 / 768 / 1280 / 1440, reduced-motion, 404 at 390 / 1280, before-shot for refinement delta.

---

## 5. Remaining blockers (post-M4b)

- Gate E closure: owner approval to set `published` + `evidenceComplete: true` (narrative already applied under preview)
- Cloudflare Pages: connect account + production deep-link verify
- Upstream `geo-areas-php` future backlog (credentials, write endpoints, GitHub update, PT/EN) — [UPSTREAM_BACKLOG.md](../gate-e/UPSTREAM_BACKLOG.md); **not** Portfolio scope; no `hrefRepo` until credentials fixed
- M5 not started
