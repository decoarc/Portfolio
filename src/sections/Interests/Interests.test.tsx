import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { siteEn } from '../../content/en/site.ts'
import { Interests } from './Interests.tsx'

describe('Interests', () => {
  it('é a seção #interests, nomeada pelo h2 do rótulo', () => {
    render(<Interests index={4} copy={siteEn.interests} />)
    const section = screen.getByRole('region', {
      name: siteEn.interests.label,
    })
    expect(section).toHaveAttribute('id', 'interests')
    expect(
      screen.getByRole('heading', { level: 2, name: siteEn.interests.label }),
    ).toBeVisible()
    expect(screen.getByText('04')).toBeInTheDocument()
  })

  it('lista os quatro interesses, em ordem', () => {
    render(<Interests index={4} copy={siteEn.interests} />)
    expect(
      screen.getAllByRole('listitem').map((item) => item.textContent),
    ).toEqual(siteEn.interests.items)
  })
})
