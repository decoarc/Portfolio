# Gate E — Final Owner Decisions (Map Areas)

**Recorded:** 2026-10-22  
**Source:** Owner answers replacing prior open questions in `UNVERIFIED_AND_OPEN_QUESTIONS.md`  
**Apply pass:** Controlled content apply — **does not** set `published` / `evidenceComplete: true`

---

## Decision log (11)

| # | Topic | Final decision |
|---|-------|----------------|
| **1** | Problem / motivation | Personal project created to **learn and apply foundational GIS concepts**. Not a client brief. |
| **2** | Role / ownership | Developed **individually** — frontend, backend, and database. |
| **3** | Period | **2025–2026** (display as a range, not a single year). |
| **4** | Primary outcome | Technical learning and practical application of GIS concepts. **No** invented metrics, clients, or commercial results. |
| **5** | Technologies | Only stack items verified in evidence (PHP, PostgreSQL/PostGIS, Leaflet, proj4). |
| **6** | Auth limitation | **Mention** absence of authentication on write endpoints as a technical limitation. |
| **7** | Media | Keep **cover + live demo only**; no additional gallery required for this apply pass. |
| **8** | Bilingual product | Map Areas **should become** PT/EN bilingual; i18n belongs in **geo-areas-php** and is **not authorized** in Portfolio. Case study stays English. Do **not** claim the app is already bilingual. |
| **9** | GitHub description / stale refs | Update authorized but **separate** work (upstream / later). |
| **10** | Upstream security remediation | Authorized at **planning level only** — **no** code or doc edits to `geo-areas-php` in this pass. |
| **11** | Publication flags & repo link | Keep `status: preview` and `evidenceComplete: false`. **Do not** expose `hrefRepo` until security remediation. **Do not** set `published` without explicit later approval. |

---

## Mapping to prior question IDs

| Prior Q | Resolution |
|---------|------------|
| 1 Problem (D3) | Superseded by decision 1 (learning GIS) |
| 2 Role (D4) | Decision 2 — solo FE/BE/DB |
| 3 Year (D6) | Decision 3 — period `2025–2026` |
| 4 Repo link (D5) | **No** until security fix (decision 11) |
| 5 GitHub blurb | Decision 9 — separate track |
| 6 Credentials (D8) | Decision 10 — plan only, no upstream edits |
| 7 Outcomes | Decision 4 — learning/practice only |
| 8 Writable demo | Decision 6 — state no-auth on writes |
| 9 Gallery | Decision 7 — cover + live only |
| 10 PT/EN note | Decision 8 — case study EN; product i18n planned upstream, not current |
| 11 Publish apply | **Partial:** narrative applied under preview; flags stay false until explicit approval |

---

## Planned follow-ups (out of this apply pass)

1. Upstream security scrub/rotation (`geo-areas-php`) — then consider `hrefRepo`.  
2. Upstream GitHub description refresh (MySQL/Google Maps → PostGIS/Leaflet).  
3. Upstream PT/EN internationalization.  
4. Owner approval to set `published` + `evidenceComplete: true`.  
5. Cloudflare deploy / production deep-link verify (separate).
