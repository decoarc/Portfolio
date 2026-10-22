# Project Evidence Inventory

**Milestone:** M4a  
**Primary project:** Map Areas (`slug: map-areas`)  
**Last audited:** 2026-10-22

Legend: **V** = verified from source/docs/UI · **I** = reasonable interpretation · **M** = missing / do not claim

---

## 1. Portfolio content model (current)

Implemented in `src/content/types.ts` and enforced by `src/content/projectLinks.ts`.

| Rule | Behavior |
|------|----------|
| `status: draft` | Hidden from public Work lists |
| `status: preview` | Listed; live demo OK; **no** `/work/:slug` link |
| `status: published` | Listed; case-study link only if `evidenceComplete` |
| `evidenceComplete` | Required for `canLinkCaseStudy` / `getProjectHref` |
| `assertPublicationRules` | Rejects `published` without `evidenceComplete` |
| Outcomes | May use labeled `[Outcome TBD]` — never invent metrics |

Homepage Work UI already shows Map Areas as **preview** with “Case study soon” (no case-study href). Registry: `src/content/en/projects/` → only `map-areas.ts`.

Case-study fields today (`ProjectCaseStudy`): `problem`, `responsibilities[]`, `implementation[]`, `challenges[]`, `outcomes[]`, optional `gallery[]`, plus summary fields (`slug`, `title`, `tagline`, `stack`, `year?`, `coverImage`, `hrefLive?`, `hrefRepo?`).

---

## 2. Map Areas — identity & links

| Item | Value | Class |
|------|-------|-------|
| Portfolio title | Map Areas | V (content + UI `<title>`) |
| Repo (local) | `DEV/geo-areas-php` | V |
| Repo (remote) | `https://github.com/decoarc/geo-areas-php` | V |
| Live demo | `https://geo-areas-php.onrender.com/` | V (prototype + Portfolio `hrefLive`) |
| Cover image | `public/images/projects/map-areas.webp` (+ `-800.webp`) from prototype PNG | V |
| Current Portfolio status | `preview`, `evidenceComplete: false` | V |
| `hrefRepo` in Portfolio content | unset | M (should set when publishing narrative) |
| GitHub repo description | Still says “MySQL and Google Maps API” | V (outdated vs code) |
| UI language | Portuguese (`lang="pt-BR"`, PT copy) | V |
| Default map center | São Paulo `[-23.55052, -46.633308]`, zoom 12 | V |

---

## 3. Map Areas — technologies (verified)

| Technology | Evidence |
|------------|----------|
| PHP 8.x (Docker image 8.2) | `Dockerfile`, README prerequisites |
| PDO + `pdo_pgsql` | `connection.php`, Dockerfile |
| PostgreSQL + PostGIS | `schema.sql`, `docker-compose.yml` (`postgis/postgis:16-3.4`), README |
| Geometry storage `GEOMETRY(Polygon, 4326)` | `schema.sql`, `ST_GeomFromText` in `save_area.php` |
| Leaflet + Leaflet.Draw (CDN unpkg) | `index.php` |
| OpenStreetMap tiles | `L.tileLayer('https://{s}.tile.openstreetmap.org/...')` |
| proj4php | `composer.json`, `coordinate_converter.php` |
| Client coordinate helpers | `coordinate-converter.js` |
| Docker Compose for local DB | `docker-compose.yml`, `docker/init.sql` |
| Render-style deploy | `Dockerfile` → `php -S 0.0.0.0:$PORT` |
| TypeScript batch utilities | `update-perimeter.ts`, `package.json` scripts (maintenance, not UI) |

**Stack note for Portfolio:** Current tags `['PHP', 'Maps', 'Geospatial']` are directionally correct but under-specify PostGIS/Leaflet. Prefer something like `PHP`, `PostgreSQL/PostGIS`, `Leaflet` when copy is rewritten — still no proficiency theater.

**Do not claim:** Google Maps API, MySQL as the current primary store (GitHub blurb / older `mysql2` dep in `package.json` look like leftovers from pre-migration; commit history includes `feat: migrate from MySQL to PostgreSQL/PostGIS`).

---

## 4. Map Areas — verifiable features

| Feature | Evidence | Class |
|---------|----------|-------|
| Draw polygons on map (Leaflet.Draw; polygon only) | `index.php` draw control config | V |
| Clear current drawing | `#clearBtn` handler | V |
| Name + optional description before save | sidebar inputs → `save_area.php` | V |
| Persist polygon to DB as WKT/PostGIS | `geo_helpers.php` `coordsToWKT`, `ST_GeomFromText` | V |
| Compute area km² via `ST_Area(geography)` | `save_area.php` | V |
| Compute perimeter km via `ST_Perimeter(geography)` | `save_perimeter.php` (follow-up after save) | V |
| List saved areas; select one (radio); fit bounds | `loadAreas()` | V |
| Show description / area / perimeter modal | info button + polygon click → modal | V |
| Live coordinate readout Lat/Lng | format buttons + list | V |
| Convert display to UTM / GMS | `coordinate_converter.php` actions `utm` / `gms` | V |
| Add polygon by pasted coordinates (Lat/Lng, UTM, GMS) | coords modal + `from_utm` / `from_gms` | V |
| Southern-hemisphere UTM handling | commit `a082325` + `+south` in UTM def | V |
| Disable scroll-wheel zoom | `scrollWheelZoom: false` | V |
| Sidebar + map layout | `style.css` + markup | V |
| Delete saved areas from UI | — | M (not found) |
| User authentication / multi-tenant | — | M (none) |
| Edit geometry of already-saved areas | Draw edit only for in-progress feature group; saved load is display | I (limited) |

---

## 5. Map Areas — engineering decisions (evidenced)

| Decision | Evidence | Class |
|----------|----------|-------|
| Prefer PostGIS spatial types over ad-hoc lat/lng tables | schema + migration commit | V |
| Store WGS84 polygons; measure on geography | `ST_Area` / `ST_Perimeter` on `::geography` | V |
| Server-side proj4 for UTM (not only client) | `coordinate_converter.php` + proj4php | V |
| Thin PHP endpoints + mostly client UI | `save_area.php`, `get_areas.php`, large inline JS in `index.php` | V |
| Local DB via Docker PostGIS image | compose + README | V |
| Production via containerized PHP built-in server | `Dockerfile` `php -S` | V |
| OSM + Leaflet vs Google Maps | current code; GitHub description stale | V / I |

---

## 6. Map Areas — limitations (honest, verified or strong)

| Limitation | Class | Notes for case study |
|------------|-------|----------------------|
| No auth on write endpoints | V | Public demo can accept writes if DB is reachable |
| `Access-Control-Allow-Origin: *` on converter | V | Acceptable for demo; call out as non-production hardening |
| Plaintext DB password in README / compose | V | **Do not republish credentials** in Portfolio docs or case study; recommend scrubbing upstream |
| Render free-tier cold start | V | Observed wake screen when fetching live URL |
| GitHub description outdated | V | Fix upstream or ignore in narrative |
| `package.json` still mentions MySQL tooling | V | Do not list MySQL as current stack |
| UI PT-only | V | Portfolio site is EN — case study can describe PT product UI |
| Outcomes / users / scale metrics | M | Keep `[Outcome TBD]` or qualitative status only |
| Problem/motivation narrative | M | Not in README; needs author statement |
| Extra gallery shots (draw flow, modal, UTM) | M | Only Work cover exists in Portfolio today |

---

## 7. Map Areas — screenshots & demonstrations

| Asset | Status | Class |
|-------|--------|-------|
| Work cover (São Paulo map + sidebar) | In Portfolio WebP | V |
| Live demo URL | Linked from Work | V |
| Screen recording / guided demo | Missing | M |
| Additional stills (coords modal, UTM, saved list) | Missing in Portfolio | M |
| Prototype PNG source | `prototype/public/assets/components/Projects/map-areas.png` (read-only) | V |

---

## 8. Other candidates (repo material present)

Only listed when a local repo with README (and usually a GitHub remote) exists. **None** are in the Portfolio registry yet. None have Portfolio-optimized covers or case-study copy.

| Candidate | Local path | Remote | What the README supports | Suggested Portfolio stance |
|-----------|------------|--------|---------------------------|----------------------------|
| AssetFlow | `DEV/AssetFlow` | `decoarc/AssetFlow` | Laravel 12 + React/TS CMMS; Docker; tests | **draft** until demo/screens + André decides scope for public case study |
| JobTrack | `DEV/JobTrack` | `decoarc/JobTrack` | Next.js job-application tracker; Postgres/Drizzle | **draft** — needs deploy URL or screenshots + narrative |
| MindHub | `DEV/MindHub` | `decoarc/MindHub` | Tauri 2 desktop + React/Rust | **draft** — desktop demos are harder; needs intentional capture plan |
| NR1 Risk / occupational-risk-platform | `DEV/occupational-risk-platform` | `decoarc/occupational-risk-platform` | High-fidelity SST risk **prototype** (in-memory; not production) | **draft** — honest “prototype” framing required if ever shown |

**Not inventoried for v1:** clones, unfinished experiments, and repos without enough public-facing documentation to avoid invention.

---

## 9. Fact / interpretation / missing summary (Map Areas)

### Safe to state as verified

- Personal geospatial web app to draw/save/view map polygons.
- Stack centers on PHP, PostgreSQL/PostGIS, Leaflet/Leaflet.Draw, proj4php, Docker, Render deploy artifact.
- Features: draw, clear, save with name/description, list/select, area & perimeter via PostGIS, Lat/Lng·UTM·GMS display and coordinate-entry modal.
- Live demo and public GitHub repo exist; Portfolio already lists live demo under `preview`.

### Reasonable interpretations (label as such in drafts)

- Solo personal/learning project (repo under `decoarc`, no co-author evidence found).
- Motivated by geospatial practice (maps + coordinate systems + spatial DB) rather than a named client brief.
- MySQL → PostGIS migration reflects intentional hardening of spatial storage.

### Must not invent / still missing

- Client name, company impact, user counts, performance numbers, “production-grade security.”
- Formal role title beyond ownership of the codebase.
- Polished EN case-study narrative (problem, contributions, outcomes).
- Gallery beyond the single cover; confirmation André wants `hrefRepo` public on the Work card.
