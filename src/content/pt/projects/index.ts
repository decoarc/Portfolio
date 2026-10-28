import type { Project } from '../../types.ts'
import { localEmailClient } from './local-email-client.ts'
import { mapAreas } from './map-areas.ts'

/** Mesma ordem de `en/projects/index.ts`; o teste de paridade confere. */
export const projectsPt: Project[] = [mapAreas, localEmailClient]
