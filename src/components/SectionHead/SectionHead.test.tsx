import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { SectionHead } from './SectionHead.tsx'

describe('SectionHead', () => {
  it('h2 com o id recebido e nome sem o número', () => {
    render(
      <SectionHead
        index={2}
        headingId="sobre"
        title="Sobre"
        intro="Introdução."
      />,
    )
    expect(
      screen.getByRole('heading', { level: 2, name: 'Sobre' }),
    ).toHaveAttribute('id', 'sobre')
    expect(screen.getByText('02')).toBeInTheDocument()
    expect(screen.getByText('Introdução.')).toBeVisible()
  })

  it('sem intro, não renderiza parágrafo', () => {
    const { container } = render(
      <SectionHead index={1} headingId="x" title="Título" />,
    )
    expect(container.querySelector('p')).toBeNull()
  })
})
