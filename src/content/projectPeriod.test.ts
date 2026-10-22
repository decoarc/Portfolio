import { describe, expect, it } from 'vitest'
import { getProjectPeriodLabel } from './projectPeriod'

describe('getProjectPeriodLabel', () => {
  it('prefers period over year', () => {
    expect(
      getProjectPeriodLabel({ period: '2025–2026', year: 2025 }),
    ).toBe('2025–2026')
  })

  it('falls back to numeric year', () => {
    expect(getProjectPeriodLabel({ year: 2024 })).toBe('2024')
  })

  it('returns null when neither is set', () => {
    expect(getProjectPeriodLabel({})).toBeNull()
  })
})
