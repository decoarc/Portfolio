import { describe, expect, it } from 'vitest'
import { siteEn } from '../content/en/site.ts'
import { homeSections } from './homeSections.ts'

describe('homeSections', () => {
  it('ordem fixa das seções da home', () => {
    expect(homeSections(siteEn)).toEqual([
      'work',
      'approach',
      'about',
      'interests',
      'contact',
    ])
  })

  it('omite interests quando não há itens', () => {
    const site = { ...siteEn, interests: { ...siteEn.interests, items: [] } }
    expect(homeSections(site)).toEqual(['work', 'approach', 'about', 'contact'])
  })

  it('omite approach quando não há itens', () => {
    const site = { ...siteEn, approach: { ...siteEn.approach, items: [] } }
    expect(homeSections(site)).toEqual([
      'work',
      'about',
      'interests',
      'contact',
    ])
  })
})
