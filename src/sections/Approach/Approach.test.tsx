import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { siteEn } from '../../content/en/site.ts'
import { Approach } from './Approach.tsx'

describe('Approach', () => {
  it('é a seção #approach, nomeada pelo h2 do rótulo', () => {
    render(<Approach index={2} copy={siteEn.approach} />)
    const section = screen.getByRole('region', { name: siteEn.approach.label })
    expect(section).toHaveAttribute('id', 'approach')
    const heading = screen.getByRole('heading', {
      level: 2,
      name: siteEn.approach.label,
    })
    expect(heading).toBeVisible()
    // As fichas também são numeradas (01–03): o número da seção é o que
    // acompanha o h2.
    expect(heading.previousElementSibling).toHaveTextContent('02')
    expect(screen.getByText(siteEn.approach.intro)).toBeVisible()
  })

  it('cada item é uma ficha com título h3 e corpo', () => {
    render(<Approach index={2} copy={siteEn.approach} />)
    const items = screen.getAllByRole('listitem')
    expect(items).toHaveLength(3)
    siteEn.approach.items.forEach((item, i) => {
      expect(
        within(items[i]).getByRole('heading', { level: 3, name: item.title }),
      ).toBeVisible()
      expect(within(items[i]).getByText(item.body)).toBeVisible()
    })
  })
})
