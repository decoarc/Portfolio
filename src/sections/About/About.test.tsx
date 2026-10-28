import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { siteEn } from '../../content/en/site.ts'
import { About } from './About.tsx'

describe('About', () => {
  it('é a seção #about, nomeada pelo h2 do rótulo', () => {
    render(<About index={6} copy={siteEn.about} />)
    const section = screen.getByRole('region', { name: siteEn.about.label })
    expect(section).toHaveAttribute('id', 'about')
    expect(
      screen.getByRole('heading', { level: 2, name: siteEn.about.label }),
    ).toBeVisible()
    expect(screen.getByText('06')).toBeInTheDocument()
  })

  it('mostra lead e corpo, sem a lista "Working with"', () => {
    render(<About index={6} copy={siteEn.about} />)
    expect(screen.getByText(siteEn.about.lead)).toBeVisible()
    expect(screen.getByText(siteEn.about.body)).toBeVisible()
    expect(screen.queryByText('Working with')).toBeNull()
  })
})
