import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { siteEn } from '../../content/en/site.ts'
import type { SiteContent } from '../../content/types.ts'
import { Trajectory } from './Trajectory.tsx'

const copy = siteEn.trajectory
const [current] = copy.experience

/** A experiência real mais um cargo anterior, para ver o fio com dois itens. */
const withPrevious: SiteContent['trajectory'] = {
  ...copy,
  experience: [
    current,
    {
      ...current,
      period: '2024 — 2025',
      start: '2024-01',
      current: false,
      role: 'Previous role',
    },
  ],
}

describe('Trajectory', () => {
  it('é a região #trajectory nomeada pelo h2, com número e abertura', () => {
    render(<Trajectory index={1} copy={copy} />)
    const section = screen.getByRole('region', { name: copy.label })
    expect(section).toHaveAttribute('id', 'trajectory')
    expect(screen.getByText('01')).toBeInTheDocument()
    expect(screen.getByText(copy.intro)).toBeVisible()
  })

  it('experiência é uma lista ordenada com cargo, empresa, período em <time> e tecnologias', () => {
    const { container } = render(<Trajectory index={1} copy={copy} />)
    const list = screen.getByRole('list', { name: copy.experienceLabel })
    expect(list.tagName).toBe('OL')
    const [item] = within(list).getAllByRole('listitem')
    expect(within(item).getByText(current.role)).toBeVisible()
    expect(within(item).getByText(/Witek/)).toBeVisible()
    expect(within(item).getByText(current.summary)).toBeVisible()
    const time = container.querySelector('time[datetime="2025-10"]')
    expect(time).toHaveTextContent('Oct 2025 — present')
    const tech = within(item).getByRole('list')
    expect(
      within(tech)
        .getAllByRole('listitem')
        .map((li) => li.textContent),
    ).toEqual(current.tech)
  })

  it('o item atual é marcado por atributo, não só por cor', () => {
    render(<Trajectory index={1} copy={withPrevious} />)
    const list = screen.getByRole('list', { name: copy.experienceLabel })
    const items = within(list)
      .getAllByRole('listitem')
      .filter((li) => li.parentElement === list)
    expect(items).toHaveLength(2)
    expect(items.filter((li) => li.hasAttribute('data-current'))).toEqual([
      items[0],
    ])
  })

  it('formação é uma lista separada, rotulada, com período, curso e instituição', () => {
    render(<Trajectory index={1} copy={copy} />)
    const list = screen.getByRole('list', { name: copy.educationLabel })
    const items = within(list).getAllByRole('listitem')
    expect(items).toHaveLength(copy.education.length)
    copy.education.forEach((entry, i) => {
      expect(items[i]).toHaveTextContent(entry.period)
      expect(items[i]).toHaveTextContent(entry.course)
      expect(items[i]).toHaveTextContent(entry.institution)
    })
  })

  it('nenhum link ou botão na seção', () => {
    render(<Trajectory index={1} copy={copy} />)
    const section = screen.getByRole('region', { name: copy.label })
    expect(within(section).queryAllByRole('link')).toHaveLength(0)
    expect(within(section).queryAllByRole('button')).toHaveLength(0)
  })
})
