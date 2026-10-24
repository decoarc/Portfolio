# Upstream backlog — `geo-areas-php` (Map Areas original)

**Status:** Future backlog only — **not** in current Portfolio scope  
**Target repository:** `geo-areas-php` (sibling project; not under `Portfolio/`)  
**Authorization:** Documented here for tracking. **Do not** implement these items in this pass.  
**Portfolio coupling:** Map Areas stays `preview` / `evidenceComplete: false`; **do not** set `hrefRepo` on the site until credential security is remediated.

---

## Scope boundary

| In this backlog | Out of this backlog |
|-----------------|---------------------|
| Work that belongs in the original Map Areas app repo | Portfolio UI, routing, case-study publish flags |
| Security, write-endpoint review, GitHub metadata, product i18n | Applying or expanding Portfolio case-study copy |
| Future authorized PRs in `geo-areas-php` | Edits under `prototype/` or `Portfolio/` for these items |

These tasks **do not** block day-to-day Portfolio milestones (M5/M6). They **do** gate showing a public repository link on the Work / case-study surfaces.

---

## Backlog items

### 1. Credential security

| Field | Detail |
|-------|--------|
| Goal | Remove committed plaintext DB password patterns; keep secrets out of git; rotate any reused values |
| Where | Upstream setup docs, Compose config, env examples; hosting dashboards if the same value was reused |
| References | [UPSTREAM_SECURITY_PLAN.md](./UPSTREAM_SECURITY_PLAN.md), [MAP_AREAS_SECURITY_REVIEW.md](../m4a/MAP_AREAS_SECURITY_REVIEW.md) |
| Portfolio rule | Never copy secret values into Portfolio docs or content. No `hrefRepo` until this item is done. |

### 2. Write-endpoint review

| Field | Detail |
|-------|--------|
| Goal | Review public save / perimeter (and related) write paths; decide harden, gate, or keep intentionally open for a learning demo |
| Where | Upstream PHP persistence endpoints used by the live demo |
| Note | Case study already states no authentication on writes as a limitation; upstream may later disable or protect writes |
| Portfolio rule | Honesty about demo limits stays; remediation happens only in `geo-areas-php` |

### 3. GitHub repository update

| Field | Detail |
|-------|--------|
| Goal | Refresh GitHub description / stale metadata so recruiters are not sent to MySQL / Google Maps framing |
| Where | Upstream GitHub repo settings and any outdated README stack claims |
| Note | Separate from Portfolio copy; do not surface the repo link on the site until item 1 is complete |

### 4. Internationalization (PT / EN)

| Field | Detail |
|-------|--------|
| Goal | Make the **product** UI bilingual (Portuguese + English) |
| Where | `geo-areas-php` only |
| Portfolio rule | Case study remains English. Do **not** claim the live app is already bilingual. Product i18n is **not** Portfolio work. |

---

## Explicit non-actions (current pass)

- [x] No code or doc edits in `geo-areas-php`
- [x] No start of credential scrub, endpoint hardening, GitHub blurb, or product i18n
- [x] No `hrefRepo` on Map Areas content
- [x] Flags unchanged: `status: 'preview'`, `evidenceComplete: false`

---

## When this backlog is done (Portfolio follow-up)

Only after item **1** (credentials) is remediated in upstream, consider a **separate** Portfolio content pass to add `hrefRepo`.  
Items 2–4 improve the upstream product and credibility; they are not required to keep Map Areas in preview on the Portfolio.
