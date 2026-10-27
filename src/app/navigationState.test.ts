import { describe, expect, it } from 'vitest'
import { INSTANT_SCROLL, wantsInstantScroll } from './navigationState.ts'

describe('wantsInstantScroll', () => {
  it('só o estado INSTANT_SCROLL pede rolagem imediata', () => {
    expect(wantsInstantScroll(INSTANT_SCROLL)).toBe(true)
    expect(wantsInstantScroll({ scroll: 'smooth' })).toBe(false)
    expect(wantsInstantScroll(null)).toBe(false)
    expect(wantsInstantScroll('instant')).toBe(false)
  })
})
