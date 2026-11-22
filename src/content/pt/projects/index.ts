import type { Project } from '../../types.ts'
import { localEmailClient } from './local-email-client.ts'
import { mapAreas } from './map-areas.ts'
import { portfolio } from './portfolio.ts'
import { theAbyss } from './the-abyss.ts'

/** Mesma ordem de `en/projects/index.ts`; o teste de paridade confere. */
export const projectsPt: Project[] = [
  portfolio,
  theAbyss,
  mapAreas,
  localEmailClient,
]
