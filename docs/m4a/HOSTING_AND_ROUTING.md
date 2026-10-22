# Hosting and Routing Decision Proposal (Gate D)

**Milestone:** M4a — proposal only  
**Do not implement** routing, host config, or new dependencies in this milestone  
**App today:** Vite + React SPA, home-only shell (`src/app/routes.tsx`), no React Router yet

---

## 1. Problem

Case studies need shareable URLs: `/work/:slug`.

On a static host, a hard refresh (or shared link) requests that path from the CDN/origin. Without an SPA fallback, the host returns **404** because only `/index.html` exists on disk after `vite build`.

Gate D (from `ARCHITECTURE.md` / `IMPLEMENTATION_PLAN.md`): choose host + SPA fallback **before** finalizing case-study routing.

---

## 2. Constraints

| Constraint | Implication |
|------------|-------------|
| Existing Vite app | Deploy `dist/` from `pnpm build` |
| No new paid plans / serverless without approval | Prefer free static hosting |
| No new dependencies in M4a | Router install deferred to M4b after host choice |
| Portfolio remote | `https://github.com/decoarc/Portfolio.git` |
| Custom `base` | Prefer site root (`base: '/'`) to avoid asset-path pain |

---

## 3. Options compared

| Host | Fit for Vite SPA | SPA deep-link fallback | Notes |
|------|------------------|------------------------|-------|
| **Cloudflare Pages** (recommended) | Excellent | `public/_redirects`: `/* /index.html 200` or dashboard “SPA” behavior | Fast CDN; GitHub integration; free tier adequate |
| **Netlify** | Excellent | Same `_redirects` or `netlify.toml` `/* /index.html 200` | Equally fine; pick if André prefers Netlify UX |
| **GitHub Pages** | Good with care | Copy `index.html` → `404.html`, or Actions plugin; set `base` if project-site URL | Matches “GitHub habit”; more footguns for project pages (`/Portfolio/`) |
| **Vercel** | Excellent | Framework preset / rewrites to `index.html` | Fine; not required |

**Not recommended for v1:** SSR frameworks, PHP hosting for the portfolio itself, or coupling portfolio deploy to the Map Areas Render service.

---

## 4. Recommendation

### Primary: Cloudflare Pages (or Netlify — same pattern)

1. Connect `decoarc/Portfolio` → build `pnpm build` → publish directory `dist`.  
2. Ship SPA fallback from the repo (author in M4b / M6, not M4a):

   ```text
   # public/_redirects  (Cloudflare Pages & Netlify)
   /*    /index.html   200
   ```

3. Keep Vite `base: '/'` (default) with a root custom domain or `*.pages.dev` / `*.netlify.app` site.  
4. Verify Gate D with: open `https://<host>/work/map-areas` in a fresh tab (hard navigation), confirm the SPA boots and the router renders the case study or intentional soft-404 — not the host’s raw 404 page.

### If André prefers GitHub Pages

- Prefer a **user/org site** or **custom domain at root** so `base` stays `/`.  
- Avoid `https://decoarc.github.io/Portfolio/` unless willing to set `base: '/Portfolio/'` and test all asset paths.  
- Add `404.html` identical to `index.html` (classic GH Pages SPA trick) and document it in M6.

---

## 5. Application routing plan (M4b — after Gate D)

| Route | Behavior |
|-------|----------|
| `/` | Home (current) |
| `/work/:slug` | Case study **only** if `status === 'published'` && `evidenceComplete` |
| `/work/:unknown` or unpublished | Branded not-found / unavailable — never blank crash |
| `*` | Same branded 404 |

Implementation sketch (not authorized in M4a):

- Add `react-router` (already planned in README as Gate D–gated).  
- Replace home-only `routes.tsx` with a small route table; keep page components dumb.  
- Reuse `getProjectHref` / `canLinkCaseStudy` so homepage CTAs cannot point at unpublished slugs.  
- Preserve `/#work` anchors on the home page.

Homepage redesign is **out of scope**; Work cards only gain a real “Case study” link when publication rules pass.

---

## 6. Relationship to Map Areas hosting

| App | Host (current) | Role |
|-----|----------------|------|
| Portfolio | TBD (this doc) | Static marketing/case-study site |
| Map Areas demo | Render (`geo-areas-php.onrender.com`) | External live demo linked via `hrefLive` |

Do not move Map Areas onto the portfolio host. Cold starts on Render are a **demo caveat**, not a portfolio deploy blocker.

---

## 7. Decision needed from André

| # | Decision | Recommendation |
|---|----------|----------------|
| D1 | Host vendor | **Cloudflare Pages** (Netlify acceptable alternate) |
| D2 | Site URL shape | Root domain or `*.pages.dev` with `base: '/'` |
| D3 | When to add `react-router` | M4b, immediately after D1/D2 lock |
| D4 | Preview deployments | Enable host PR previews if available (optional, nice for Gate E review) |

Until D1–D2 are locked, M4b may scaffold routes locally but must not claim production deep links work.
