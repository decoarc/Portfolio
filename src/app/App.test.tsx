import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('App shell', () => {
  it('renders identity and landmarks from externalized content', () => {
    render(<App />)

    expect(
      screen.getByRole('link', { name: 'Skip to content' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 1, name: 'André Arcodaci' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Full Stack Developer')).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Selected work' }),
    ).toHaveAttribute('href', '#work')
    const contactLinks = screen.getAllByRole('link', { name: 'Contact' })
    expect(contactLinks.length).toBeGreaterThanOrEqual(1)
    expect(
      contactLinks.some((link) => link.getAttribute('href') === '#contact'),
    ).toBe(true)
    expect(screen.getByRole('navigation', { name: 'Primary' })).toBeInTheDocument()
    expect(screen.getByRole('main')).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 2, name: 'Selected work' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 2, name: 'About' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 2, name: 'Contact' }),
    ).toBeInTheDocument()
  })

  it('does not emit a case-study link for unpublished projects', () => {
    render(<App />)

    expect(screen.queryByRole('link', { name: 'Case study' })).toBeNull()
    expect(screen.getByText('Case study soon')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Live demo' })).toHaveAttribute(
      'href',
      'https://geo-areas-php.onrender.com/',
    )
  })
})
