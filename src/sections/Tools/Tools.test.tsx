import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { siteEn } from '../../content/en/site.ts'
import { Tools } from './Tools.tsx'

const copy = siteEn.tools

describe('Tools', () => {
  it('é a região #tools nomeada pelo h2, com número', () => {
    render(<Tools index={2} copy={copy} />)
    const section = screen.getByRole('region', { name: copy.label })
    expect(section).toHaveAttribute('id', 'tools')
    expect(screen.getByText('02')).toBeInTheDocument()
  })

  it('cada grupo é uma lista rotulada pelo nome do grupo, com as ferramentas na ordem', () => {
    render(<Tools index={2} copy={copy} />)
    for (const group of copy.groups) {
      const list = screen.getByRole('list', { name: group.name })
      expect(
        within(list)
          .getAllByRole('listitem')
          .map((item) => item.textContent),
      ).toEqual(group.items)
    }
  })

  it('nenhuma ferramenta é link ou botão', () => {
    render(<Tools index={2} copy={copy} />)
    const section = screen.getByRole('region', { name: copy.label })
    expect(within(section).queryAllByRole('link')).toHaveLength(0)
    expect(within(section).queryAllByRole('button')).toHaveLength(0)
  })
})
