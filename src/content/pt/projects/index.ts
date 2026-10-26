import type { Project } from '../../types.ts'
import { atlasLedger } from './atlas-ledger.ts'
import { fieldNotes } from './field-notes.ts'
import { mapAreas } from './map-areas.ts'
import { tokenKiller } from './token-killer.ts'

/** Mesma ordem de `en/projects/index.ts`; o teste de paridade confere. */
export const projectsPt: Project[] = [
  mapAreas,
  tokenKiller,
  atlasLedger,
  fieldNotes,
]
