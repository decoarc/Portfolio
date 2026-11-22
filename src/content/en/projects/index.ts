import type { Project } from '../../types.ts'
import { localEmailClient } from './local-email-client.ts'
import { mapAreas } from './map-areas.ts'
import { portfolio } from './portfolio.ts'
import { theAbyss } from './the-abyss.ts'

/** Ordem de exibição: a home mostra os primeiros (`homeProjects`); a galeria, todos. */
export const projectsEn: Project[] = [
  theAbyss,
  mapAreas,
  localEmailClient,
  portfolio,
]
