import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { siteEn } from '../../content/en/site.ts'
import type { HomeSectionId } from '../../content/types.ts'
import { Release } from './Release.tsx'

const sections: HomeSectionId[] = ['work', 'about', 'contact']

describe('Release', () => {
  it('é uma nav com o nome do índice', () => {
    render(<Release copy={siteEn.release} sections={sections} />)
    expect(
      screen.getByRole('navigation', { name: siteEn.release.label }),
    ).toBeInTheDocument()
  })

  it('numera só as seções recebidas, em ordem, com links para as âncoras', () => {
    render(<Release copy={siteEn.release} sections={sections} />)
    const nav = screen.getByRole('navigation', { name: siteEn.release.label })
    const links = within(nav).getAllByRole('link')
    expect(links.map((link) => link.getAttribute('href'))).toEqual([
      '#work',
      '#about',
      '#contact',
    ])
    expect(links.map((link) => link.textContent)).toEqual([
      `01${siteEn.release.entries.work}`,
      `02${siteEn.release.entries.about}`,
      `03${siteEn.release.entries.contact}`,
    ])
  })
})
