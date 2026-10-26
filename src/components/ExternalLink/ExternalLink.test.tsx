import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ExternalLink } from './ExternalLink.tsx'

describe('ExternalLink', () => {
  it('abre em nova aba e inclui a dica no nome acessível', () => {
    render(
      <ExternalLink href="https://exemplo.dev/" hint="abre em nova aba">
        Demo
      </ExternalLink>,
    )
    const link = screen.getByRole('link', { name: 'Demo abre em nova aba' })
    expect(link).toHaveAttribute('href', 'https://exemplo.dev/')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })
})
