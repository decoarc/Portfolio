import type { ProjectCaseStudy } from '../../types'

/**
 * Map Areas — verified facts from legacy prototype.
 * Status remains preview until a full evidenced case study exists (Gate E).
 *
 * Cover asset provenance:
 * - Source: sibling `prototype/public/assets/components/Projects/map-areas.png`
 *   (1200×900 PNG, ~1.1MB; PersonalProjects preview)
 * - Optimized into Portfolio as WebP (see `public/images/projects/map-areas*.webp`)
 * - Copied read-only from prototype; prototype/ was not modified
 */
export const mapAreas: ProjectCaseStudy = {
  slug: 'map-areas',
  title: 'Map Areas',
  tagline:
    'Draw and manage polygon areas on an interactive map. Save areas, clear the canvas, and add polygons by coordinates in Lat/Lng, UTM, or GMS format.',
  // Stack tags verified from geo-areas-php (PHP, PostGIS, Leaflet, proj4php / client helpers).
  stack: ['PHP', 'PostgreSQL/PostGIS', 'Leaflet', 'proj4'],
  status: 'preview',
  featured: true,
  hrefLive: 'https://geo-areas-php.onrender.com/',
  coverImage: {
    src: '/images/projects/map-areas.webp',
    alt: 'Map Areas interface — sidebar controls beside a Leaflet map of São Paulo',
    width: 1200,
    height: 900,
  },
  problem:
    '[Problem statement TBD — expand with real project context before publishing.]',
  responsibilities: [
    '[Responsibilities TBD — list real ownership before publishing.]',
  ],
  implementation: [
    '[Implementation notes TBD — describe real technical approach before publishing.]',
  ],
  challenges: [
    '[Challenges TBD — document real constraints before publishing.]',
  ],
  outcomes: ['[Outcome TBD]'],
  evidenceComplete: false,
}
