# Gate E — Publication Readiness Checklist (Map Areas)

**Current site flags (required until explicit publish approval):**  
`status: 'preview'` · `evidenceComplete: false` · no `hrefRepo`

---

## Content apply (this pass)

| # | Criterion | Status |
|---|-----------|--------|
| 1 | `problem` real prose (owner learning-GIS voice) | **Applied** under preview |
| 2 | `responsibilities` solo FE/BE/DB | **Applied** |
| 3 | `implementation` verified technical bullets | **Applied** |
| 4 | `challenges` incl. no-auth writes | **Applied** |
| 5 | `stack` verified only | **Applied** |
| 6 | `outcomes` learning-focused; no fake metrics | **Applied** |
| 7 | Cover + live demo only | **Applied** |
| 8 | Period `2025–2026` via `period` field | **Applied** |
| 9 | PT UI note + planned bilingual (not claimed as done) | **Applied** |
| 10 | Owner reviewed for overclaim before **publish** | **Open** — preview review |

---

## Blocked until later approval

| Item | Why |
|------|-----|
| `evidenceComplete: true` | Needs explicit owner publish approval |
| `status: 'published'` | Same — unlocks homepage Case study CTA |
| `hrefRepo` | Wait for upstream credential security ([UPSTREAM_BACKLOG.md](./UPSTREAM_BACKLOG.md) §1) |
| Upstream credential scrub / write-endpoint review / GitHub blurb / PT–EN i18n | Future backlog in `geo-areas-php` — **not** Portfolio scope |

---

## Strongly recommended before publish

| Item | Status |
|------|--------|
| Upstream security plan executed | Plan only — see [UPSTREAM_BACKLOG.md](./UPSTREAM_BACKLOG.md) + [UPSTREAM_SECURITY_PLAN.md](./UPSTREAM_SECURITY_PLAN.md) |
| Write-endpoint review / GitHub blurb / product i18n | Upstream backlog only |
| Confirm preview narrative on `/work/map-areas` | After this apply |
| Cloudflare production deep-link verify | Deploy milestone |

---

## Explicit non-goals of this apply pass

- [x] No `published` / `evidenceComplete: true` without separate approval  
- [x] No `hrefRepo`  
- [x] No upstream repo edits  
- [x] No Cloudflare deploy / push  
- [x] No M5
