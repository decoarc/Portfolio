import { describe, expect, it } from 'vitest'
import { siteEn } from '../content/en/site.ts'
import { homeSections } from './homeSections.ts'

describe('homeSections', () => {
  it('ordem fixa das seções da home', () => {
    expect(homeSections(siteEn)).toEqual([
      'trajectory',
      'tools',
      'work',
      'approach',
      'interests',
      'about',
      'contact',
    ])
  })

  it('omite interests quando não há itens', () => {
    const site = { ...siteEn, interests: { ...siteEn.interests, items: [] } }
    expect(homeSections(site)).toEqual([
      'trajectory',
      'tools',
      'work',
      'approach',
      'about',
      'contact',
    ])
  })

  it('omite approach quando não há itens', () => {
    const site = { ...siteEn, approach: { ...siteEn.approach, items: [] } }
    expect(homeSections(site)).toEqual([
      'trajectory',
      'tools',
      'work',
      'interests',
      'about',
      'contact',
    ])
  })
})
