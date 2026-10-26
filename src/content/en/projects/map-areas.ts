import type { Project } from '../../types.ts'

/**
 * Map Areas — conteúdo do Gate E (decisões do dono, 2026-10-22), portado do
 * site anterior. Fica em `preview` até aprovação explícita de publicação.
 * Sem link de repositório: o repo é privado até resolver credenciais no
 * upstream (docs/gate-e/UPSTREAM_BACKLOG.md).
 */
export const mapAreas: Project = {
  slug: 'map-areas',
  title: 'Map Areas',
  type: 'verified',
  status: 'preview',
  summary:
    'Draw and manage polygon areas on an interactive map. Save areas, clear the canvas, and add polygons by coordinates in Lat/Lng, UTM, or GMS format.',
  role: 'Solo developer',
  year: '2025–2026',
  stack: ['PHP', 'PostgreSQL/PostGIS', 'Leaflet', 'proj4'],
  cover: {
    src: '/images/projects/map-areas.webp',
    alt: 'Map Areas interface — sidebar controls beside a Leaflet map of São Paulo',
    width: 1200,
    height: 900,
  },
  sections: [
    {
      heading: 'Problem and motivation',
      paragraphs: [
        'Map Areas is a personal project I built to learn and apply foundational GIS concepts—capturing polygons on a map, persisting them in a spatial database, measuring area and perimeter, and converting coordinates between Lat/Lng, UTM, and GMS—without depending on a full desktop GIS suite.',
      ],
    },
    {
      heading: 'Role and contributions',
      items: [
        'Designed and built the map frontend (Leaflet + Leaflet.Draw) for drawing, listing, and inspecting polygon areas.',
        'Implemented the PHP backend endpoints and PostgreSQL/PostGIS schema for polygon persistence, area, and perimeter.',
        'Added server-side Lat/Lng ↔ UTM ↔ GMS conversion with southern-hemisphere UTM support (proj4php).',
        'Packaged local PostGIS via Docker and a containerized PHP path for the public demo.',
      ],
    },
    {
      heading: 'Engineering decisions',
      items: [
        'Store polygons as GEOMETRY(Polygon, 4326) with a GIST index; convert client rings to WKT for ST_GeomFromText.',
        'Measure area and perimeter with PostGIS geography functions so results are in km² and km.',
        'Limit Leaflet.Draw to polygons; use OpenStreetMap tiles for the basemap.',
        'Run projection transforms on the server with proj4php for display conversion and coordinate-paste polygon creation.',
      ],
    },
    {
      heading: 'Technical challenges',
      items: [
        'Getting trustworthy area and perimeter from drawings by measuring on geography, not planar degrees.',
        'Supporting UTM and GMS correctly for southern Brazil, including hemisphere-aware UTM definitions.',
        'Keeping a thin PHP API plus client map architecture while adding real spatial and CRS features.',
        'Hosting a public demo with free-tier cold starts and no authentication on write endpoints—acceptable for learning demos, not production hardening.',
      ],
    },
    {
      heading: 'Outcomes and current status',
      items: [
        'Primary outcome: hands-on learning and practical application of GIS fundamentals (spatial storage, map editing, and coordinate systems).',
        'Live demo publicly available for the draw → save → inspect workflow (cold starts possible on free hosting).',
        'Product UI is currently Portuguese; bilingual PT/EN support is a planned improvement in the original application repository (not implemented in this portfolio).',
      ],
    },
  ],
  links: [{ kind: 'live', href: 'https://geo-areas-php.onrender.com/' }],
}
