import type { Project } from '../../types.ts'
import { localEmailClient } from './local-email-client.ts'
import { mapAreas } from './map-areas.ts'

/** Ordem de exibição na home. */
export const projectsEn: Project[] = [mapAreas, localEmailClient]
