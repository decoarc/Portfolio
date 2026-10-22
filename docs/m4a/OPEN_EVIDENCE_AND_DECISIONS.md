# Remaining Evidence and Decisions

**Milestone:** M4a close-out  
**Blocks:** Gate D (hosting), Gate E (publish Map Areas), M4b start

---

## 1. Decisions required from André

| ID | Decision | Needed for | Options / recommendation |
|----|----------|------------|---------------------------|
| **D1** | Portfolio host | Gate D / M4b routes | **Cloudflare Pages** (or Netlify); see [HOSTING_AND_ROUTING.md](./HOSTING_AND_ROUTING.md) |
| **D2** | Production URL shape | Vite `base`, asset paths | Prefer root / custom domain with `base: '/'` |
| **D3** | Confirm Map Areas problem/motivation wording | Gate E | Approve or rewrite the interpretation in the inventory |
| **D4** | Confirm solo ownership / role bullets | Gate E | Any collaborators to credit? |
| **D5** | Show `hrefRepo` on Work + case study? | Content | Recommend **yes** → `https://github.com/decoarc/geo-areas-php` |
| **D6** | Project `year` on Map Areas | Content polish | Optional; confirm year of primary work |
| **D7** | Second project for v1 Work list? | Scope | Recommend **no** until Map Areas case study ships |
| **D8** | Scrub upstream credentials in `geo-areas-php` README/compose | Hygiene / credibility | Do outside Portfolio; do not copy secrets into docs |

---

## 2. Remaining evidence to collect

### Map Areas (before `evidenceComplete`)

| Item | Why | Suggested action |
|------|-----|------------------|
| Author-approved problem paragraph | `problem` still TBD in content | Short EN statement from André |
| 2–4 extra screenshots | Stronger case study / CLS-safe gallery | Capture draw, list, coords modal, UTM; optimize to WebP under `public/images/projects/` |
| Optional short demo clip or GIF | Demonstration without cold-start friction | Host as file or external link — only if André wants |
| Confirm live demo is OK to stay writable | Honesty about public POST endpoints | Keep as limitation bullet or add read-only demo later (out of Portfolio scope) |
| Update GitHub repo description | Avoid contradicting PostGIS/Leaflet story | Change upstream blurb away from MySQL/Google Maps |

### Other projects (only if promoting beyond draft)

| Item | Applies to |
|------|------------|
| Cover image + alt + dimensions | Any new Work card |
| Accurate tagline from running UI | Any |
| Live URL or explicit “no live demo” | AssetFlow, JobTrack, NR1 |
| Case-study narrative with evidence | Before `published` |

---

## 3. Prerequisites before M4b

| Prerequisite | Status after M4a |
|--------------|------------------|
| M3 motion approved | Done (per authorization) |
| M4a inventory + specs | This folder |
| Gate D host choice (D1/D2) | **Open** |
| Gate E Map Areas evidence | **Open** (inventory ready; content not written into app yet) |
| No homepage redesign | Respected |
| No GSAP/Lenis/WebGL / no new deps in M4a | Respected |

**M4b may start only after explicit approval.** Prefer locking D1/D2 before or at the start of M4b so deep-link config is not reworked.

---

## 4. Suggested approval checklist for this milestone

- [ ] Evidence inventory accepted as accurate (fact / interpretation / missing)  
- [ ] Case-study content spec accepted as the template for M4b  
- [ ] Hosting recommendation accepted or alternate host named (D1/D2)  
- [ ] Publication readiness accepted (Map Areas stays `preview`)  
- [ ] Explicit go-ahead for **M4b** (routes + template) — separate from filling Gate E copy if desired  

---

## 5. Out of scope reminders

- Do not implement React Router or `_redirects` until M4b / deploy milestone authorization.  
- Do not start M5.  
- Do not modify `prototype/` or publish incomplete case studies.
