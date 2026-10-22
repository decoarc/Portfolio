# Map Areas — Proposed Case-Study Narrative (Gate E draft)

**Audience:** Recruiters / hiring managers  
**Language:** English (product UI is Portuguese — state once)  
**Status:** **Draft for owner review** — not applied to `map-areas.ts`  
**Publication flags today:** stay `preview` / `evidenceComplete: false` until a later apply pass  

Field labels match `ProjectCaseStudy` / [CASE_STUDY_CONTENT_SPEC.md](../m4a/CASE_STUDY_CONTENT_SPEC.md).  
Inline tags: **[V]** verified · **[I]** interpretation pending confirmation · **[M]** missing

---

## A. Overview (summary fields)

| Field | Proposed value | Class |
|-------|----------------|-------|
| `title` | Map Areas | V |
| `tagline` | *(keep current)* Draw and manage polygon areas on an interactive map. Save areas, clear the canvas, and add polygons by coordinates in Lat/Lng, UTM, or GMS format. | V |
| `stack` | `PHP`, `PostgreSQL/PostGIS`, `Leaflet`, `proj4` | V |
| `year` | `2025` **or** omit until confirmed (git shows work from 2025-09 with 2026 PostGIS/deploy commits) | I / M |
| `hrefLive` | `https://geo-areas-php.onrender.com/` | V |
| `hrefRepo` | `https://github.com/decoarc/geo-areas-php` | V (confirm display) |
| `coverImage` | Existing WebP + alt | V |

**One-line positioning (for narrative chrome, not a typed field):**  
A personal geospatial web app for drawing, persisting, and inspecting map polygons with real spatial measurements and coordinate-system conversion. **[V]** / framing **[I]**

---

## B. Problem and motivation (`problem`)

### Proposed prose (needs owner OK — currently interpretation)

> I wanted a lightweight way to draw land or study areas on a map, store them, and work with coordinates in Lat/Lng, UTM, and GMS without standing up a full desktop GIS stack. Map Areas is that tool: a browser map for polygon capture, a spatial database for persistence and measurements, and server-side projection helpers for the coordinate formats I actually use in Brazil.

| Element | Class |
|---------|-------|
| Need for draw + persist + multi-format coords | I (strong candidate; not in upstream README) |
| “Without heavy GIS suite” | I |
| Brazil / São Paulo context | I (map defaults to São Paulo **[V]**; personal location elsewhere in portfolio **[V]** but not proof of project motivation) |
| Named client / employer brief | M — **do not invent** |

**Owner action:** Approve, rewrite, or replace this paragraph in your own words.

---

## C. Role and contributions (`responsibilities[]`)

### Proposed bullets (solo-ownership interpretation — confirm)

1. Designed and built the end-to-end map UI (Leaflet + Leaflet.Draw) for polygon capture, listing, and inspection. **[V]** feature set / **[I]** sole ownership  
2. Implemented PHP persistence endpoints and PostGIS schema for polygon storage, area, and perimeter. **[V]** code / **[I]** sole ownership  
3. Added server-side coordinate conversion (proj4php) for Lat/Lng ↔ UTM ↔ GMS, including southern-hemisphere UTM handling. **[V]** / **[I]** ownership  
4. Packaged local development with Dockerized PostGIS and a containerized PHP deploy path for the public demo. **[V]** / **[I]** ownership  
5. Migrated spatial storage from MySQL-oriented beginnings to PostgreSQL/PostGIS. **[V]** commit / **[I]** decision ownership  

**Do not claim** team lead, client delivery, or formal job title without confirmation. **[M]**

---

## D. Technologies (`stack` + optional prose)

Already accurate on the site. Optional one-liner for implementation section context:

> PHP serves thin JSON endpoints; PostgreSQL/PostGIS stores `GEOMETRY(Polygon, 4326)`; Leaflet/OSM power the map; proj4php handles projection math on the server. **[V]**

---

## E. Technical challenges (`challenges[]`)

### Proposed bullets (prefer verified constraints)

1. **Meaningful area and perimeter** — planar degree math is misleading; measurements use PostGIS `geography` (`ST_Area` / `ST_Perimeter`) so values are in SI units (km² / km). **[V]**  
2. **Coordinate reference correctness** — supporting UTM and GMS for Brazil required careful zone/hemisphere handling (southern UTM `+south`), not only Lat/Lng display. **[V]**  
3. **Keeping the surface area small** — delivering draw → save → measure → convert without a heavy GIS product, using a thin PHP API and a substantial client map layer. **[V]** structure / **[I]** “challenge” framing  
4. **Honest demo hosting** — public Render free-tier cold starts and an unauthenticated write surface are real operational constraints, not polish details. **[V]**  

---

## F. Engineering decisions (`implementation[]`)

### Proposed bullets

1. Store polygons as PostGIS geometry in WGS84 (EPSG:4326) with a GIST index, rather than ad-hoc lat/lng row dumps. **[V]**  
2. Convert client ring coordinates to WKT and insert via `ST_GeomFromText`, computing area on insert and perimeter in a follow-up update path. **[V]**  
3. Constrain Leaflet.Draw to polygons to match the product goal (areas, not free-form markers/lines). **[V]**  
4. Run projection transforms on the server with proj4php so UTM/GMS conversion stays consistent for both display and “paste coordinates to create polygon” flows. **[V]**  
5. Use Docker Compose for local PostGIS and a simple PHP built-in server container for the hosted demo — enough to ship a working geospatial loop without overbuilding infrastructure. **[V]**  

---

## G. Outcomes and current status (`outcomes[]`)

### Proposed qualitative lines (safe)

1. Public live demo demonstrates the full draw → save → inspect loop (expect cold starts on free hosting). **[V]**  
2. Source is available on GitHub for technical review. **[V]**  
3. Demonstrates a practical PostGIS + Leaflet workflow with multi-format coordinate input/output. **[V]**  

### Explicit placeholders (if owner has nothing more)

4. `[Outcome TBD — no measured user/adoption metrics]` **[M]**

**Do not invent:** MAU, client logos, “production in company X,” latency benchmarks.

---

## H. Media notes

See [RECOMMENDED_MEDIA.md](./RECOMMENDED_MEDIA.md). Minimum for publish: current cover + live demo **[V]**. Gallery optional but strengthens recruiter scan.

**Fact to state once near media or overview:** The product UI is in Portuguese; this case study is written in English. **[V]**

---

## Suggested `map-areas.ts` field pack (copy-ready after approval)

> Do **not** paste until owner approves. Shown here for review convenience.

```ts
problem:
  'I wanted a lightweight way to draw study areas on a map, store them, and work with Lat/Lng, UTM, and GMS without a full desktop GIS. Map Areas is that tool: browser polygon capture, PostGIS persistence and measurements, and server-side projection helpers.',

responsibilities: [
  'Built the Leaflet map UI for drawing, listing, and inspecting polygon areas.',
  'Implemented PHP endpoints and a PostGIS schema for polygon persistence, area, and perimeter.',
  'Added server-side Lat/Lng ↔ UTM ↔ GMS conversion with southern-hemisphere UTM support.',
  'Packaged local PostGIS via Docker and a containerized PHP demo deploy path.',
],

implementation: [
  'Store polygons as GEOMETRY(Polygon, 4326) with a GIST index; convert client rings to WKT for ST_GeomFromText.',
  'Measure area and perimeter with PostGIS geography functions for SI units.',
  'Limit Leaflet.Draw to polygons; use OSM tiles for the basemap.',
  'Run projection transforms on the server with proj4php for display conversion and coordinate-paste creation.',
],

challenges: [
  'Getting trustworthy area/perimeter from map drawings (geography-based measurement, not planar degrees).',
  'Supporting UTM and GMS correctly for southern Brazil, including hemisphere-aware UTM definitions.',
  'Keeping a thin PHP + client map architecture while adding real spatial and CRS features.',
  'Hosting an honest public demo with free-tier cold starts and no authentication on write endpoints.',
],

outcomes: [
  'Live demo publicly available for the draw → save → inspect workflow (cold starts possible).',
  'Source available on GitHub for technical review.',
  'Demonstrates PostGIS + Leaflet with multi-format coordinate input and output.',
],
```

---

## Architecture sketch (for reviewers; not a site section)

```text
Browser (PT UI)
  Leaflet + Leaflet.Draw + OSM
  coordinate-converter.js ──POST──► coordinate_converter.php (proj4php)
  save / list / perimeter  ──JSON──► save_area.php / get_areas.php / save_perimeter.php
                                         │
                                         ▼
                              PostgreSQL + PostGIS
                              areas(coords GEOMETRY Polygon 4326, area, perimeter)
```

This diagram is supported by the file layout and SQL above **[V]**.
