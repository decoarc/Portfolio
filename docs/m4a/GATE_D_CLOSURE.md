# Gate D Closure — Hosting Locked, M4b Not Started

**Date:** 2026-10-22  
**Status:** Gate D **prepared / hosting decision locked**  
**Scope of this close-out:** Git housekeeping, Cloudflare Pages decision, Map Areas credential hygiene review, case-study readiness vs M4a inventory  
**Explicit non-goals:** No React Router, no `public/_redirects`, no Cloudflare account connect, no deploy, no case-study page implementation

---

## 1. Verdict

| Item | Result |
|------|--------|
| Hosting vendor (D1) | **Locked: Cloudflare Pages** |
| Site URL shape (D2) | **Locked intent:** root / `*.pages.dev` with Vite `base: '/'` (custom domain optional later) |
| SPA fallback strategy | Documented; **file not authored yet** (M4b / deploy milestone) |
| Deep-link verification on live host | **Not done** — requires first deploy |
| Map Areas publication (Gate E) | **Still open** — keep `preview` / `evidenceComplete: false` |
| M4b implementation | **Not started** — awaiting explicit go-ahead |

Gate D’s planning blocker (“choose host + SPA fallback before finalizing case-study routing”) is **satisfied for planning**. Production deep-link verification remains a **deploy-time** checklist item once Cloudflare is connected.

---

## 2. Git housekeeping

| Action | Result |
|--------|--------|
| Inspected `.gitignore` for `.tools/` | Safe — excludes local Playwright validation tooling under `.tools/m3-validate/` only |
| Committed separately | `75efa6a` — `chore: ignore local .tools directory` |
| Prior commits on `main` | M3 `fa101d2`, M4a `9dd9792` |
| Push to `origin/main` | Completed (fast-forward; no force) |
| Unrelated dirty worktree at push | None |

---

## 3. Hosting decision (summary)

Full detail: [HOSTING_AND_ROUTING.md](./HOSTING_AND_ROUTING.md).

| Topic | Decision |
|-------|----------|
| Platform | Cloudflare Pages |
| Build command | `pnpm build` (`tsc -b && vite build`) |
| Publish directory | `dist` |
| Vite `base` | `/` (default; keep unless project-page URL is forced) |
| SPA fallback | `public/_redirects` → `/* /index.html 200` (author in M4b) |
| Direct nav / refresh `/work/:slug` | Host rewrite serves `index.html`; app router decides published vs soft-404 |
| True missing assets | Still 404 at CDN for missing static files; unknown routes soft-404 in-app |
| Deploy now? | **No** — document only |

---

## 4. Map Areas security review (summary)

Full detail: [MAP_AREAS_SECURITY_REVIEW.md](./MAP_AREAS_SECURITY_REVIEW.md).  
**No secret values are recorded in Portfolio docs.**

| Finding class | Notes |
|---------------|-------|
| Potentially real secrets in public upstream files | Plaintext Postgres password in tracked `README.md` and `docker-compose.yml` |
| Placeholders | `.env.example` uses a clear placeholder |
| Local-only | `.env` gitignored; not tracked |
| App code pattern | `connection.php` loads DB settings from env (no hardcoded password in PHP source) |
| Upstream modified by this work? | **No** |

Remediation belongs in `geo-areas-php` with André’s authorization; rotate if the exposed value was reused anywhere remote (e.g. Render).

---

## 5. Case-study readiness (summary)

Full detail: [CASE_STUDY_READINESS.md](./CASE_STUDY_READINESS.md).

| Area | Ready to populate from verified facts? |
|------|----------------------------------------|
| Overview + stack (PHP, PostGIS, Leaflet, proj4) | **Yes** (stack tags updated in content; narrative still Gate E) |
| Implementation / challenges (tech) | **Yes** from inventory |
| Responsibilities (solo ownership) | **Interpretation** — needs André OK |
| Problem / motivation | **Blocked** — needs author voice |
| Outcomes (metrics) | **Blocked** — qualitative only or `[Outcome TBD]` |
| Gallery extras | **Optional / missing** |
| Status flags | Keep **`preview`** + **`evidenceComplete: false`** |

---

## 6. Remaining blockers

### Before M4b start (recommended)

1. Explicit André go-ahead for **M4b** (routes + case-study template).  
2. Accept this Gate D closure (Cloudflare Pages locked).

### During / end of M4b (deploy-related)

3. Author `public/_redirects` and wire React Router.  
4. Connect Cloudflare Pages to `decoarc/Portfolio` (manual; not done here).  
5. Verify hard navigation + refresh on `/work/map-areas` (soft-404 OK while unpublished).

### Before Gate E / publish Map Areas

6. Author-approved problem paragraph and responsibility bullets.  
7. Fill implementation / challenges / outcomes without invention.  
8. Prefer `hrefRepo`; optional gallery stills.  
9. Upstream credential scrub + rotation (hygiene; separate repo).  
10. Optionally fix stale GitHub repo description (MySQL / Google Maps).

---

## 7. Recommendation for starting M4b

**Ready to start M4b on explicit approval.** Hosting choice is locked; M4a inventory and case-study spec are sufficient to scaffold:

- `react-router` + `/work/:slug`
- publication-aware soft-404
- case-study page shell using existing `ProjectCaseStudy` fields
- `public/_redirects` for Cloudflare Pages

**Do not** mark Map Areas `published` or `evidenceComplete: true` inside M4b unless Gate E criteria are met in the same authorization. Prefer shipping routes with preview projects intentionally unlinkable / soft-404 on direct URL.
