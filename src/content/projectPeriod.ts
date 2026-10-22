import type { ProjectSummary } from './types'

/**
 * Display label for project timing.
 * `period` wins when set (e.g. "2025–2026"); otherwise numeric `year`.
 */
export function getProjectPeriodLabel(
  project: Pick<ProjectSummary, 'year' | 'period'>,
): string | null {
  const period = project.period?.trim()
  if (period) {
    return period
  }
  if (typeof project.year === 'number' && Number.isFinite(project.year)) {
    return String(project.year)
  }
  return null
}
