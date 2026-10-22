import type { ProjectCaseStudy } from '../../types'

/**
 * Map Areas — stub from verified prototype facts.
 * Status remains preview until a full evidenced case study exists (Gate E).
 * Cover uses a local placeholder; optimized screenshot can replace later.
 */
export const mapAreas: ProjectCaseStudy = {
  slug: 'map-areas',
  title: 'Map Areas',
  tagline:
    'Draw and manage polygon areas on an interactive map. Save areas, clear the canvas, and add polygons by coordinates in Lat/Lng, UTM, or GMS format.',
  stack: ['PHP', 'Maps', 'Geospatial'],
  status: 'preview',
  featured: true,
  hrefLive: 'https://geo-areas-php.onrender.com/',
  coverImage: {
    src: '/images/projects/map-areas-placeholder.svg',
    alt: 'Placeholder plate for Map Areas project preview',
    width: 1600,
    height: 1000,
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
