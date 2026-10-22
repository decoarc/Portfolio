# Map Areas — Evidence References

**Sources (read-only):**  
- Portfolio: `docs/m4a/PROJECT_EVIDENCE_INVENTORY.md`, `CASE_STUDY_CONTENT_SPEC.md`, `CASE_STUDY_READINESS.md`  
- App: `src/content/en/projects/map-areas.ts` (current preview stubs)  
- Upstream: `DEV/geo-areas-php` → `https://github.com/decoarc/geo-areas-php`  
- Live demo: `https://geo-areas-php.onrender.com/`

Legend: **V** verified · **I** interpretation · **M** missing

---

## 1. Identity & links

| Claim | Class | Anchor |
|-------|-------|--------|
| Title “Map Areas” | V | Portfolio content; app UI |
| Public GitHub repo under `decoarc/geo-areas-php` | V | Remote URL |
| Live demo on Render | V | Portfolio `hrefLive`; Dockerfile deploy shape |
| Product UI in Portuguese (`pt-BR`) | V | `index.php` `lang` + PT copy |
| Default map center São Paulo | V | Leaflet init coords in `index.php` |
| Initial commits ~2025-09-30; PostGIS/Dockerfile work dated 2026-06-17 | V | `git log` (dates only) |
| Project `year` field for Portfolio | M / I | Suggest **2025** or **2025–2026** after owner OK |

---

## 2. Architecture & stack

| Claim | Class | Anchor |
|-------|-------|--------|
| PHP 8.2 container runtime | V | `Dockerfile` (`php:8.2-cli`) |
| PDO + `pdo_pgsql` | V | Dockerfile ext install; `connection.php` |
| PostgreSQL + PostGIS | V | `schema.sql`, Compose PostGIS image, README |
| Table `areas` with `GEOMETRY(Polygon, 4326)` + GIST index | V | `schema.sql` |
| Leaflet + Leaflet.Draw via CDN; OSM tiles | V | `index.php` |
| proj4php for server CRS transforms | V | `composer.json`, `coordinate_converter.php` |
| Client helpers call PHP converter | V | `coordinate-converter.js` |
| Local DB via Docker Compose | V | `docker-compose.yml`, README |
| Deploy artifact: container + `php -S` | V | `Dockerfile` `CMD` |
| Migrated from MySQL to PostGIS | V | Commit `01ed24e` message + current schema |
| Current stack is **not** Google Maps / MySQL | V | Code vs stale GitHub blurb |

---

## 3. Mapping & persistence flow

| Claim | Class | Anchor |
|-------|-------|--------|
| Draw polygons only (Leaflet.Draw) | V | Draw control config in `index.php` |
| Clear in-progress drawing | V | Clear handler |
| Save name + optional description | V | Sidebar → `save_area.php` |
| Client coords → WKT polygon | V | `geo_helpers.php` `coordsToWKT` |
| Persist with `ST_GeomFromText(..., 4326)` | V | `save_area.php` |
| Area km² via `ST_Area(...::geography) / 1e6` | V | `save_area.php` |
| Perimeter via `ST_Perimeter` geography (follow-up endpoint) | V | `save_perimeter.php` + history |
| List / select / fit bounds saved areas | V | `get_areas.php` + client `loadAreas()` |
| Info modal for description / area / perimeter | V | UI + commits |

---

## 4. Coordinate transformations

| Claim | Class | Anchor |
|-------|-------|--------|
| Display / convert Lat/Lng ↔ UTM ↔ GMS | V | Converter actions `utm`, `gms`, `from_utm`, `from_gms` |
| UTM zone + southern hemisphere (`+south`) | V | `coordinate_converter.php`; commit `a082325` |
| Paste coordinates to create polygon | V | Coords modal + client parsers |
| Server-side proj4 (not client-only) | V | PHP endpoint + Composer dep |

---

## 5. Engineering tradeoffs & limitations (honest)

| Claim | Class | Anchor |
|-------|-------|--------|
| Thin PHP JSON endpoints + substantial client JS | V | `save_area.php`, `get_areas.php`, large `index.php` script |
| No authentication on write paths | V | Endpoint surface; inventory |
| Permissive CORS on converter (`*`) | V | Headers in `coordinate_converter.php` |
| Plaintext DB password in upstream README/Compose | V | File presence only — **do not copy values into Portfolio** |
| Render free-tier cold starts | V | Observed on live URL (M4a) |
| No delete-from-UI found | M | Inventory search |
| No multi-tenant / auth product story | M | None in codebase |
| Outcomes / users / performance metrics | M | None measured in docs |

---

## 6. What must not appear in the published case study

- Any database passwords, connection strings, or `.env` contents  
- Claims of production-grade security, enterprise clients, or user counts  
- Google Maps or MySQL as **current** stack  
- Invented employers, titles, or awards
