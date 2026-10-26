import type { Project } from '../../types.ts'
import { atlasLedger } from './atlas-ledger.ts'
import { fieldNotes } from './field-notes.ts'
import { mapAreas } from './map-areas.ts'
import { tokenKiller } from './token-killer.ts'

/** Ordem de exibição na home. */
export const projectsEn: Project[] = [
  mapAreas,
  tokenKiller,
  atlasLedger,
  fieldNotes,
]
