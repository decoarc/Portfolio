# Remaining Evidence and Decisions

**Milestone:** Gate D close-out (post-M4a)  
**Blocks:** Gate E (publish Map Areas); M4b start still needs explicit go-ahead  
**Resolved this close-out:** Hosting D1/D2 → Cloudflare Pages (see [GATE_D_CLOSURE.md](./GATE_D_CLOSURE.md))

---

## 1. Decisions required from André

| ID | Decision | Needed for | Status / recommendation |
|----|----------|------------|-------------------------|
| **D1** | Portfolio host | Gate D / M4b routes | **Locked — Cloudflare Pages** ([HOSTING_AND_ROUTING.md](./HOSTING_AND_ROUTING.md)) |
| **D2** | Production URL shape | Vite `base`, asset paths | **Locked intent —** root / `*.pages.dev` with `base: '/'` |
| **D3** | Confirm Map Areas problem/motivation wording | Gate E | Approve or rewrite the interpretation in the inventory |
| **D4** | Confirm solo ownership / role bullets | Gate E | Any collaborators to credit? |
| **D5** | Show `hrefRepo` on Work + case study? | Content | Recommend **yes** → `https://github.com/decoarc/geo-areas-php` |
| **D6** | Project `year` on Map Areas | Content polish | Optional; confirm year of primary work |
| **D7** | Second project for v1 Work list? | Scope | Recommend **no** until Map Areas case study ships |
| **D8** | Scrub upstream credentials in `geo-areas-php` README/compose | Hygiene / credibility | See [MAP_AREAS_SECURITY_REVIEW.md](./MAP_AREAS_SECURITY_REVIEW.md); do outside Portfolio; do not copy secrets into docs |
| **D9** | Explicit go-ahead for **M4b** | Routes + template | **Open** — hosting no longer blocks planning |

---

## 2. Remaining evidence to collect

### Map Areas (before `evidenceComplete`)

| Item | Why | Suggested action |
|------|-----|------------------|
| Author-approved problem paragraph | `problem` still TBD in content | Short EN statement from André |
| Responsibility bullets confirmed | Ownership framing | Confirm solo vs collaborators |
| Case-study body from inventory | `implementation` / `challenges` still TBD stubs | Draft from [CASE_STUDY_READINESS.md](./CASE_STUDY_READINESS.md) in Gate E / authorized content pass |
| 2–4 extra screenshots | Stronger case study / CLS-safe gallery | Capture draw, list, coords modal, UTM; optimize to WebP under `public/images/projects/` |
| Optional short demo clip or GIF | Demonstration without cold-start friction | Host as file or external link — only if André wants |
| Confirm live demo is OK to stay writable | Honesty about public POST endpoints | Keep as limitation bullet or add read-only demo later (out of Portfolio scope) |
| Update GitHub repo description | Avoid contradicting PostGIS/Leaflet story | Change upstream blurb away from MySQL/Google Maps |
| Upstream credential scrub + rotation | Public README/Compose exposure | Authorized work in `geo-areas-php` only |

### Other projects (only if promoting beyond draft)

| Item | Applies to |
|------|------------|
| Cover image + alt + dimensions | Any new Work card |
| Accurate tagline from running UI | Any |
| Live URL or explicit “no live demo” | AssetFlow, JobTrack, NR1 |
| Case-study narrative with evidence | Before `published` |

---

## 3. Prerequisites before M4b

| Prerequisite | Status |
|--------------|--------|
| M3 motion approved | Done (per authorization) |
| M4a inventory + specs | Done (`docs/m4a/`) |
| Gate D host choice (D1/D2) | **Locked** — Cloudflare Pages |
| Gate D SPA fallback **documented** | **Done** — file authoring deferred to M4b |
| Gate D live deep-link verification | **Deferred** until first Cloudflare deploy |
| Gate E Map Areas evidence | **Open** (inventory ready; narrative not written into app yet) |
| Explicit M4b go-ahead (D9) | **Open** |
| No homepage redesign | Respected |
| No GSAP/Lenis/WebGL / no new deps in Gate D prep | Respected |

**M4b may start only after explicit approval (D9).** Hosting choice is no longer an open planning blocker.

---

## 4. Suggested approval checklist

- [x] Evidence inventory accepted as planning baseline (fact / interpretation / missing)  
- [x] Case-study content spec accepted as the template for M4b  
- [x] Hosting decision locked: Cloudflare Pages (D1/D2)  
- [x] Publication readiness: Map Areas stays `preview`  
- [ ] Explicit go-ahead for **M4b** (routes + template) — separate from filling Gate E copy if desired  
- [ ] Gate E content approval before `published` + `evidenceComplete`

---

## 5. Out of scope reminders

- Do not implement React Router or `_redirects` until M4b authorization.  
- Do not connect Cloudflare or deploy until a deploy milestone / André asks.  
- Do not start M5.  
- Do not modify `prototype/` or `geo-areas-php/` without separate authorization.  
- Do not publish incomplete case studies.
