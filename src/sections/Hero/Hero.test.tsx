import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { siteEn } from '../../content/en/site.ts'
import { Hero } from './Hero.tsx'

describe('Hero', () => {
  it('o nome é o h1', () => {
    render(<Hero person={siteEn.person} copy={siteEn.hero} />)
    expect(
      screen.getByRole('heading', { level: 1, name: siteEn.person.name }),
    ).toBeVisible()
  })

  it('mostra a função e o statement', () => {
    render(<Hero person={siteEn.person} copy={siteEn.hero} />)
    expect(screen.getByText(siteEn.person.role)).toBeVisible()
    expect(screen.getByText(siteEn.hero.statement)).toBeVisible()
  })

  it('os dois CTAs levam a #work e #contact', () => {
    render(<Hero person={siteEn.person} copy={siteEn.hero} />)
    expect(
      screen.getByRole('link', { name: siteEn.hero.ctaPrimary }),
    ).toHaveAttribute('href', '#work')
    expect(
      screen.getByRole('link', { name: siteEn.hero.ctaSecondary }),
    ).toHaveAttribute('href', '#contact')
  })
})
