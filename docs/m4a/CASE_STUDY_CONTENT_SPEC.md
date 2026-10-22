# Case-Study Content Specification

**Milestone:** M4a  
**Audience:** M4b implementers filling `ProjectCaseStudy` modules  
**Constraint:** No fabricated achievements; label unknowns

---

## 1. Purpose

Define a reusable content structure for `/work/:slug` pages that:

1. Maps cleanly onto existing `ProjectCaseStudy` types (extend only if M4b needs a field).
2. Separates **verified facts**, **labeled interpretations**, and **explicit TBDs**.
3. Keeps homepage Work cards thin (summary + cover + CTAs) while case studies carry depth.

---

## 2. Status workflow (unchanged)

```text
draft ──► preview ──► published
              │              │
              │              └── requires evidenceComplete: true
              └── listed; live demo OK; no case-study link
```

| Gate | Requirement |
|------|-------------|
| List on homepage | `preview` or `published` |
| Emit `/work/:slug` CTA | `published` **and** `evidenceComplete` |
| Soft-404 / unavailable for direct URL | unpublished or incomplete (M4b routing behavior) |

---

## 3. Section structure (page outline)

Use this order on the case-study page. Field mapping shows where copy lives in content modules.

| # | Section (user-facing) | Content fields | Rules |
|---|----------------------|----------------|-------|
| A | **Project overview** | `title`, `tagline`, `stack`, `year?`, `coverImage`, `hrefLive?`, `hrefRepo?` | Overview = what it is in 1–2 sentences (tagline) + meta. Cover required with intrinsic dimensions. |
| B | **Problem and motivation** | `problem` | Real context only. If unknown, keep a single labeled TBD — do not invent a client story. |
| C | **Role and contributions** | `responsibilities[]` | Bullet ownership. Prefer “built / designed / migrated” tied to repo evidence. |
| D | **Technologies** | `stack` (+ optional prose in `implementation`) | Names of tools actually in the repo/deploy. No proficiency ratings. |
| E | **Technical challenges** | `challenges[]` | Real constraints (CRS conversion, spatial measurement, deploy cold starts, etc.). |
| F | **Engineering decisions** | `implementation[]` | Decisions and approach (PostGIS geography, Leaflet.Draw-only polygons, server proj4…). |
| G | **Outcomes and current status** | `outcomes[]` | Qualitative OK (“live demo on Render”, “personal learning project”). Metrics only if measured. Else `[Outcome TBD]`. |
| H | **Screenshots and demonstrations** | `coverImage`, `gallery?`, `hrefLive` | Every image: `src`, `alt`, `width`, `height`. Live demo is a demonstration, not a metric. |

Optional chrome (M4b UI, not necessarily typed fields): back to Work, external link safety (`rel="noopener noreferrer"`), “Case study” vs “Live demo” labels from `site.work`.

---

## 4. Evidence completeness checklist

Set `evidenceComplete: true` only when **all** of the following hold:

- [ ] `problem` is real prose (no `[… TBD]` placeholders)
- [ ] `responsibilities` has ≥1 verified ownership bullets
- [ ] `implementation` has ≥1 real technical approach bullets
- [ ] `challenges` has ≥1 real constraint bullets
- [ ] `stack` matches current architecture (not stale GitHub blurb)
- [ ] `outcomes` are honest (TBD allowed **only** as explicit labeled items)
- [ ] Cover image is real project UI (not a generic stock placeholder)
- [ ] Live and/or repo links, if shown, resolve and match the project
- [ ] André has reviewed the draft for overclaim

Gallery is recommended but **not** required for `evidenceComplete` if the cover + live demo adequately show the product.

---

## 5. Map Areas — draft field fill guide

Use inventory classes. Do **not** paste into `map-areas.ts` until M4b + Gate E approval.

### A. Overview (mostly ready)

| Field | Suggested direction | Class |
|-------|---------------------|-------|
| `title` | Map Areas | V |
| `tagline` | Keep/adapt current draw·save·coordinate-format summary | V |
| `stack` | `PHP`, `PostgreSQL/PostGIS`, `Leaflet`, `proj4` | V (applied in content module at Gate D prep) |
| `year` | Optional — confirm from André / git history before setting | M |
| `hrefLive` | `https://geo-areas-php.onrender.com/` | V |
| `hrefRepo` | `https://github.com/decoarc/geo-areas-php` | V (add when ready) |
| `coverImage` | Existing WebP | V |

### B. Problem (needs author voice)

| Class | Guidance |
|-------|----------|
| M | No written problem statement in upstream README |
| I (candidate, needs André OK) | Need a personal tool to draw land/areas on a map, persist them, and work in Lat/Lng, UTM, and GMS without a heavy GIS suite |

### C. Role

| Class | Guidance |
|-------|----------|
| I | Solo builder: UI, PHP endpoints, PostGIS schema, coordinate conversion, Docker/Render packaging — unless André names collaborators |

### D–F. Tech / challenges / decisions

Pull bullets only from [PROJECT_EVIDENCE_INVENTORY.md](./PROJECT_EVIDENCE_INVENTORY.md) §§3–6. Prefer:

- PostGIS polygon storage + geography measurements  
- Leaflet.Draw constrained to polygons  
- Server-side UTM/GMS conversion (incl. southern hemisphere)  
- Dockerized PostGIS for local dev; containerized PHP for deploy  

Challenges to consider (verified constraints, not drama): CRS correctness, measuring area/perimeter meaningfully, keeping a simple PHP surface area while adding spatial features, free-host cold starts.

### G. Outcomes

Safe qualitative examples:

- Live demo publicly reachable (with cold-start caveat)  
- Source available on GitHub  
- Demonstrates PostGIS + map editing workflow  

Unsafe: user counts, revenue, “used by companies,” performance benchmarks without measurement.

### H. Media

Minimum for publish: current cover + live demo.  
Recommended before Gate E: 2–4 stills (draw, save list, coords modal, UTM readout).

---

## 6. Content module conventions

```text
src/content/en/projects/<slug>.ts   # one module per project
src/content/en/projects/index.ts    # registry array
```

- English case-study copy even if the product UI is PT (state that fact once).
- Keep components free of hard-coded project facts.
- Prefer short bullets over long essays.
- When unsure: omit or TBD — never inflate.

---

## 7. Relationship to homepage

Homepage Work row continues to use summary fields only. Case-study sections B–H appear only on `/work/:slug` after publication rules pass. Preview projects keep “Case study soon.”
