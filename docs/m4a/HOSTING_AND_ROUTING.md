# Hosting and Routing — Gate D Decision (Locked)

**Milestone:** Gate D closure (post-M4a)  
**Decision date:** 2026-10-22  
**Status:** **D1/D2 locked** — Cloudflare Pages; Vite `base: '/'`  
**Do not implement in this close-out:** React Router, `_redirects` file, Cloudflare account connect, or production deploy  
**App today:** Vite + React SPA, home-only shell (`src/app/routes.tsx`), no React Router yet

Related: [GATE_D_CLOSURE.md](./GATE_D_CLOSURE.md) · [M4b planning](../m4b/README.md)

---

## 1. Problem

Case studies need shareable URLs: `/work/:slug`.

On a static host, a hard refresh (or shared link) requests that path from the CDN/origin. Without an SPA fallback, the host returns **404** because only `/index.html` exists on disk after `vite build`.

Gate D: choose host + SPA fallback **before** finalizing case-study routing.

---

## 2. Locked decision

| # | Decision | Locked value |
|---|----------|--------------|
| **D1** | Host vendor | **Cloudflare Pages** |
| **D2** | Site URL shape | Root custom domain **or** `*.pages.dev` with Vite **`base: '/'`** |
| **D3** | When to add `react-router` | **M4b** (after explicit go-ahead) |
| **D4** | Preview deployments | Enable Cloudflare Pages preview deployments when the project is connected (optional; nice for Gate E review) |

**Alternates deferred:** Netlify remains an acceptable emergency alternate (same `_redirects` pattern). GitHub Pages / Vercel not chosen for v1.

**Not for v1:** SSR frameworks, PHP hosting for the portfolio itself, or coupling portfolio deploy to the Map Areas Render service.

---

## 3. Vite production build configuration

| Item | Value | Source |
|------|-------|--------|
| Package manager | `pnpm` (`packageManager`: `pnpm@10.33.0`) | `package.json` |
| Node | `>=20` | `engines` |
| Build script | `pnpm build` → `tsc -b && vite build` | `package.json` |
| Vite config | `@vitejs/plugin-react`; alias `@` → `./src`; default `base` | `vite.config.ts` |
| **`base`** | Keep **`/`** (Vite default; do not set project-page base) | Locked with D2 |
| Typecheck gate | Build runs `tsc -b` before Vite | Same script |
| Local prod smoke | `pnpm preview` serves `dist/` | `package.json` |

No Cloudflare-specific Vite plugin is required for a static SPA.

---

## 4. Deployment output directory

| Item | Value |
|------|-------|
| Publish directory | **`dist`** |
| Typical contents | `index.html`, hashed assets under `dist/assets/`, copied `public/` files |
| Cloudflare Pages settings (when connecting later) | Build command `pnpm build`; output directory `dist`; install command `pnpm install` (or Cloudflare’s pnpm detection) |

---

## 5. SPA fallback behavior

Author in M4b / deploy milestone (not yet in repo):

```text
# public/_redirects  (Cloudflare Pages)
/*    /index.html   200
```

| Behavior | Expected |
|----------|----------|
| Meaning of `200` rewrite | CDN serves `index.html` **without** changing the browser URL |
| Client router | Reads `/work/:slug` and renders case study or branded unavailable state |
| Missing static file (e.g. wrong asset hash) | Still a real CDN 404 — fallback is for **HTML navigations**, not broken assets |

---

## 6. Direct navigation to `/work/:slug`

| Step | What happens |
|------|----------------|
| 1 | User opens `https://<host>/work/map-areas` (or any slug) in a fresh tab |
| 2 | Cloudflare applies SPA rewrite → `index.html` |
| 3 | SPA boots; router matches `/work/:slug` |
| 4a | If `published` **and** `evidenceComplete` → case-study page |
| 4b | Else → branded soft-404 / unavailable (never a blank crash; never rely on Cloudflare’s generic HTML 404 for app routes) |

Until M4b ships the router, deep links are not meaningful in production.

---

## 7. Refresh behavior

Hard refresh on `/work/:slug` must behave like direct navigation (same rewrite).  
In-app client transitions (home → case study) do not need the CDN rewrite but must not assume it is absent.

**Gate D deploy verification (future):** open a deep link in a fresh tab **and** refresh — both must boot the SPA.

---

## 8. 404 handling

| Case | Handler |
|------|---------|
| Unknown slug / draft / preview / incomplete evidence | **In-app** branded not-found or unavailable |
| SPA routes generally | Prefer in-app `*` route over host error page |
| Truly missing static assets | Host/CDN **404** |
| Optional custom host 404 | Not required if `_redirects` + in-app `*` cover HTML routes |

---

## 9. Future deployment requirements (checklist — do not execute yet)

- [ ] Connect `decoarc/Portfolio` to Cloudflare Pages (Git integration)  
- [ ] Set build: `pnpm build`, output: `dist`  
- [ ] Confirm Node version ≥ 20 on the build image  
- [ ] Add `public/_redirects` with SPA `200` rewrite (M4b)  
- [ ] Keep Vite `base: '/'`  
- [ ] After first deploy: verify `/`, `/#work`, hard-open `/work/map-areas`, refresh on that URL  
- [ ] Confirm HTTPS on the Pages URL / custom domain  
- [ ] Optional: enable preview deployments for PRs  
- [ ] Do **not** point Cloudflare at the Map Areas PHP service  

---

## 10. Application routing plan (M4b — after go-ahead)

| Route | Behavior |
|-------|----------|
| `/` | Home (current) |
| `/work/:slug` | Case study **only** if `status === 'published'` && `evidenceComplete` |
| `/work/:unknown` or unpublished | Branded not-found / unavailable |
| `*` | Same branded 404 |

Implementation sketch (authorized only in M4b):

- Add `react-router`.  
- Replace home-only `routes.tsx` with a small route table.  
- Reuse `getProjectHref` / `canLinkCaseStudy`.  
- Preserve `/#work` anchors on the home page.

Homepage redesign remains **out of scope**.

---

## 11. Relationship to Map Areas hosting

| App | Host | Role |
|-----|------|------|
| Portfolio | **Cloudflare Pages** (locked; not yet connected) | Static marketing / case-study site |
| Map Areas demo | Render (`geo-areas-php.onrender.com`) | External live demo via `hrefLive` |

Do not move Map Areas onto the portfolio host. Cold starts on Render are a demo caveat, not a portfolio deploy blocker.

---

## 12. Options considered (archive)

| Host | Fit | Why not chosen |
|------|-----|----------------|
| Cloudflare Pages | Excellent | **Chosen** |
| Netlify | Excellent | Acceptable alternate only |
| GitHub Pages | Good with care | More `base` / `404.html` footguns for project pages |
| Vercel | Excellent | Not required |
