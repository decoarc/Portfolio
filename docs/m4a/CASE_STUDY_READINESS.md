# Case-Study Readiness — Map Areas (post–Gate D prep)

**Date:** 2026-10-22  
**Content module:** `src/content/en/projects/map-areas.ts`  
**Required until Gate E:** `status: 'preview'`, `evidenceComplete: false`

---

## 1. Technology list (verified)

Evidence from `geo-areas-php` (see [PROJECT_EVIDENCE_INVENTORY.md](./PROJECT_EVIDENCE_INVENTORY.md) §3):

| Technology | Verified? | Evidence anchors |
|------------|-----------|------------------|
| PHP | Yes | Dockerfile / PHP app entrypoints |
| PostgreSQL + PostGIS | Yes | `schema.sql`, Compose PostGIS image, spatial SQL |
| Leaflet (+ Leaflet.Draw) | Yes | CDN includes + draw control in `index.php` |
| proj4 (proj4php + client helpers) | Yes | `composer.json` `proj4php/proj4php`; `coordinate_converter.php`; `coordinate-converter.js` |

**Portfolio `stack` tags (Gate D prep update):**  
`['PHP', 'PostgreSQL/PostGIS', 'Leaflet', 'proj4']`

Replaces the vaguer `Maps` / `Geospatial` labels. Still no proficiency theater. Do **not** claim Google Maps or MySQL as current stack.

---

## 2. Section readiness matrix

Mapped to [CASE_STUDY_CONTENT_SPEC.md](./CASE_STUDY_CONTENT_SPEC.md).

| Section | Fields | Populate now? | Blocker |
|---------|--------|---------------|---------|
| A. Overview | `title`, `tagline`, `stack`, `coverImage`, `hrefLive` | **Yes** (mostly already live) | Optional: `year`, `hrefRepo` |
| B. Problem | `problem` | **No** | Author voice missing (still TBD stub) |
| C. Role | `responsibilities[]` | **Draft from interpretation only** | André confirm solo ownership / wording |
| D. Technologies | `stack` (+ prose in implementation) | **Yes** | — |
| E. Challenges | `challenges[]` | **Yes (draft from inventory)** | Not yet written into module (TBD stubs remain until Gate E / M4b content pass) |
| F. Engineering decisions | `implementation[]` | **Yes (draft from inventory)** | Same — facts ready; module still TBD |
| G. Outcomes | `outcomes[]` | **Qualitative only** | No metrics; keep labeled TBD or soft qualitative lines |
| H. Media | cover + `hrefLive`; `gallery?` | **Minimum yes** | Extra stills optional |

---

## 3. What may be drafted from verified facts (for M4b/Gate E content pass)

Safe to draft (label interpretations where needed):

- Draw / save / list polygons; area & perimeter via PostGIS geography  
- Lat/Lng · UTM · GMS conversion (server proj4php; southern-hemisphere UTM handling)  
- Leaflet.Draw limited to polygons; OSM tiles  
- Docker PostGIS locally; containerized PHP on Render for the live demo  
- Limitations: no auth on writes; Render cold starts; PT-only UI

Must wait for André:

- Problem / motivation paragraph  
- Final responsibility bullets if collaborators exist  
- Any numeric outcomes  
- Whether `hrefRepo` appears on the Work card

---

## 4. Publication flags

| Flag | Required value until Gate E | Rationale |
|------|----------------------------|-----------|
| `status` | `preview` | Homepage listing + live demo OK; no case-study CTA |
| `evidenceComplete` | `false` | Narrative fields still TBD stubs |

M4b may implement `/work/:slug` routing that **soft-404s** unpublished/incomplete projects. That is not the same as publishing Map Areas.
