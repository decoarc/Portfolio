# M4b — Case-Study Routes & Template (planning only)

**Status:** **Not started** — Gate D hosting decision locked; awaiting explicit implementation go-ahead  
**Depends on:** M4a evidence pack (`docs/m4a/`), Gate D closure (`docs/m4a/GATE_D_CLOSURE.md`)  
**Does not depend on:** Gate E (Map Areas may stay `preview` while routes ship)

---

## 1. Authorized when André says go

| Work item | Notes |
|-----------|-------|
| Add `react-router` | Already listed in dependency policy after Gate D |
| Routes: `/`, `/work/:slug`, `*` | Soft-404 for unknown / unpublished / incomplete |
| Case-study page template | Bind to `ProjectCaseStudy` fields; no homepage redesign |
| `public/_redirects` | Cloudflare Pages SPA fallback: `/* /index.html 200` |
| Homepage CTAs | Keep using `canLinkCaseStudy` / `getProjectHref` |
| Tests | Route guards + publication rules; soft-404 behavior |

---

## 2. Hosting assumptions (locked)

| Setting | Value |
|---------|-------|
| Host | Cloudflare Pages |
| Build | `pnpm build` |
| Output | `dist` |
| `base` | `/` |

Do **not** connect the Cloudflare account or deploy until a deploy milestone / André asks.

---

## 3. Content rules during M4b

- Map Areas remains `preview` + `evidenceComplete: false` unless Gate E is explicitly authorized in the same pass.  
- Prefer filling case-study copy from [PROJECT_EVIDENCE_INVENTORY.md](../m4a/PROJECT_EVIDENCE_INVENTORY.md) and [CASE_STUDY_READINESS.md](../m4a/CASE_STUDY_READINESS.md).  
- Never invent metrics or client stories.  
- Never paste upstream DB credentials into content.

---

## 4. Out of scope for M4b

- M5 polish / E2E expansion beyond what routing needs  
- Homepage redesign  
- Publishing a second project  
- Modifying `prototype/` or `geo-areas-php/` without separate authorization
