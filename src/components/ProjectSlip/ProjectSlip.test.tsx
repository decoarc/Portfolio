import { render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import { siteEn } from '../../content/en/site.ts'
import type { Project } from '../../content/types.ts'
import { ProjectSlip } from './ProjectSlip.tsx'

function project(overrides: Partial<Project> = {}): Project {
  return {
    slug: 'exemplo',
    title: 'Projeto Exemplo',
    type: 'verified',
    status: 'published',
    summary: 'Resumo do projeto.',
    role: 'Dev',
    year: '2025',
    stack: ['React', 'TypeScript'],
    sections: [],
    links: [],
    ...overrides,
  }
}

const labels = {
  type: siteEn.projectType.verified,
  preview: siteEn.work.previewNote,
  links: siteEn.links,
}

function renderSlip(node: ReactNode) {
  return render(
    <MemoryRouter>
      <ol>{node}</ol>
    </MemoryRouter>,
  )
}

describe('ProjectSlip', () => {
  it('published com href: o título é um link para o case study', () => {
    const item = project()
    renderSlip(
      <ProjectSlip
        project={item}
        index={1}
        href="/work/exemplo"
        labels={labels}
      />,
    )
    expect(screen.getByRole('link', { name: item.title })).toHaveAttribute(
      'href',
      '/work/exemplo',
    )
  })

  it('preview sem href: título sem link e nota de prévia', () => {
    const item = project({ status: 'preview' })
    renderSlip(
      <ProjectSlip project={item} index={1} href={null} labels={labels} />,
    )
    expect(screen.queryByRole('link', { name: item.title })).toBeNull()
    expect(
      screen.getByRole('heading', { level: 3, name: item.title }),
    ).toBeVisible()
    expect(screen.getByText(labels.preview)).toBeVisible()
  })

  it('concept mostra o rótulo de estudo conceitual', () => {
    const item = project({ type: 'concept' })
    const conceptLabels = { ...labels, type: siteEn.projectType.concept }
    renderSlip(
      <ProjectSlip
        project={item}
        index={1}
        href="/work/exemplo"
        labels={conceptLabels}
      />,
    )
    expect(screen.getByText(siteEn.projectType.concept)).toBeVisible()
  })

  it('link externo abre em nova aba e anuncia isso no nome', () => {
    const item = project({
      links: [{ kind: 'live', href: 'https://exemplo.dev/' }],
    })
    renderSlip(
      <ProjectSlip
        project={item}
        index={1}
        href="/work/exemplo"
        labels={labels}
      />,
    )
    const link = screen.getByRole('link', {
      name: new RegExp(
        `${labels.links.labels.live}.*${labels.links.externalHint}`,
      ),
    })
    expect(link).toHaveAttribute('href', 'https://exemplo.dev/')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('mostra a stack separada por pontos médios', () => {
    renderSlip(
      <ProjectSlip
        project={project()}
        index={1}
        href="/work/exemplo"
        labels={labels}
      />,
    )
    expect(screen.getByText('React · TypeScript')).toBeVisible()
  })

  it('o número da ficha tem dois dígitos', () => {
    renderSlip(
      <ProjectSlip
        project={project()}
        index={3}
        href="/work/exemplo"
        labels={labels}
      />,
    )
    expect(screen.getByText('03')).toBeInTheDocument()
  })
})
