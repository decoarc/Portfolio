import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { createAppRoutes } from './router'

function renderAt(path: string) {
  const router = createMemoryRouter(createAppRoutes(), {
    initialEntries: [path],
  })
  return {
    user: userEvent.setup(),
    router,
    ...render(<RouterProvider router={router} />),
  }
}

describe('App routing', () => {
  it('renders the homepage at /', () => {
    renderAt('/')
    expect(
      screen.getByRole('heading', { level: 1, name: 'André Arcodaci' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Case study soon')).toBeInTheDocument()
  })

  it('shows a labeled preview for Map Areas without publishing TBD narrative', () => {
    renderAt('/work/map-areas')

    expect(
      screen.getByRole('heading', { level: 1, name: 'Map Areas' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Project preview')).toBeInTheDocument()
    expect(
      screen.getByText(/technical overview based on verified implementation/i),
    ).toBeInTheDocument()
    expect(screen.getAllByText('PostgreSQL/PostGIS').length).toBeGreaterThan(0)
    expect(
      screen.queryByText(/Problem statement TBD/i),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByText(/Responsibilities TBD/i),
    ).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Project media' })).toBeNull()
  })

  it('shows in-app not found for unknown slugs', () => {
    renderAt('/work/does-not-exist')

    expect(
      screen.getByRole('heading', { level: 1, name: /not found/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: /back to home/i }),
    ).toHaveAttribute('href', '/')
  })

  it('shows in-app not found for unknown paths', () => {
    renderAt('/nope')

    expect(
      screen.getByRole('heading', { level: 1, name: /not found/i }),
    ).toBeInTheDocument()
  })

  it('supports navigating home from a case-study preview', async () => {
    const { user } = renderAt('/work/map-areas')

    await user.click(screen.getByRole('link', { name: /André Arcodaci/i }))

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { level: 1, name: 'André Arcodaci' }),
      ).toBeInTheDocument()
    })
  })
})
