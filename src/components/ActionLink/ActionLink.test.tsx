import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ActionLink } from './ActionLink.tsx'

const HINT = 'opens in a new tab'

describe('ActionLink', () => {
  it('interno: link com href e o texto como nome', () => {
    render(
      <ActionLink href="#work" tone="strong">
        Trabalhos
      </ActionLink>,
    )
    const link = screen.getByRole('link', { name: 'Trabalhos' })
    expect(link).toHaveAttribute('href', '#work')
    expect(link).not.toHaveAttribute('target')
  })

  it('externo: nova aba, rel e dica no nome', () => {
    render(
      <ActionLink
        href="https://github.com/"
        tone="quiet"
        external={{ hint: HINT }}
      >
        GitHub
      </ActionLink>,
    )
    const link = screen.getByRole('link', { name: `GitHub ${HINT}` })
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('o traço e a prévia não entram no nome acessível', () => {
    render(
      <ActionLink
        href="https://github.com/"
        tone="quiet"
        external={{ hint: HINT }}
        peek={<span>XYZ</span>}
      >
        GitHub
      </ActionLink>,
    )
    const link = screen.getByRole('link', { name: `GitHub ${HINT}` })
    const peek = screen.getByText('XYZ')
    expect(peek.closest('[aria-hidden="true"]')).not.toBeNull()
    expect(link).not.toContainElement(peek)
  })

  it('marca os elementos com duração', () => {
    const { container } = render(
      <ActionLink href="#work" tone="strong" peek={<span>XYZ</span>}>
        Trabalhos
      </ActionLink>,
    )
    const link = screen.getByRole('link', { name: 'Trabalhos' })
    expect(link).toHaveAttribute('data-motion', 'action-link')
    expect(link.querySelector('[data-motion="trace"]')).not.toBeNull()
    expect(container.querySelector('[data-motion="peek"]')).toContainElement(
      screen.getByText('XYZ'),
    )
  })

  it('tone define a classe do traço', () => {
    render(
      <>
        <ActionLink href="#work" tone="strong">
          Forte
        </ActionLink>
        <ActionLink href="#contact" tone="quiet">
          Discreto
        </ActionLink>
      </>,
    )
    const strong = screen.getByRole('link', { name: 'Forte' }).className
    const quiet = screen.getByRole('link', { name: 'Discreto' }).className
    expect(strong).not.toBe('')
    expect(strong).not.toBe(quiet)
  })
})
