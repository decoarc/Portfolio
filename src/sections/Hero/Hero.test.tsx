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

  it('divide o nome em duas linhas que se afastam em sentidos opostos', () => {
    const { container } = render(
      <Hero person={siteEn.person} copy={siteEn.hero} />,
    )
    const drifts = [...container.querySelectorAll('[data-drift]')]
    expect(drifts.map((el) => el.getAttribute('data-drift'))).toEqual([
      '-1',
      '1',
    ])
    expect(drifts.map((el) => el.textContent)).toEqual(['André', 'Arcodaci'])
  })

  it('nome com três palavras: as demais vão juntas na segunda linha', () => {
    const { container } = render(
      <Hero
        person={{ ...siteEn.person, name: 'Ana Maria Souza' }}
        copy={siteEn.hero}
      />,
    )
    const drifts = [...container.querySelectorAll('[data-drift]')]
    expect(drifts.map((el) => el.textContent)).toEqual(['Ana', 'Maria Souza'])
    expect(
      screen.getByRole('heading', { level: 1, name: 'Ana Maria Souza' }),
    ).toBeInTheDocument()
  })
})
