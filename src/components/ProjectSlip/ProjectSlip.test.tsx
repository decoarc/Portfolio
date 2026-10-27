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
  noCapture: siteEn.work.noCapture,
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
    expect(
      screen.getByRole('link', { name: new RegExp(item.title) }),
    ).toHaveAttribute('href', '/work/exemplo')
  })

  it('preview sem href: título sem link e nota de prévia', () => {
    const item = project({ status: 'preview' })
    renderSlip(
      <ProjectSlip project={item} index={1} href={null} labels={labels} />,
    )
    expect(screen.queryByRole('link', { name: item.title })).toBeNull()
    expect(
      screen.getByRole('heading', { level: 3, name: new RegExp(item.title) }),
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
    // quem navega por título ou por link também ouve o tipo
    const typePattern = new RegExp(siteEn.projectType.concept)
    expect(
      screen.getByRole('heading', { level: 3, name: typePattern }),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: typePattern })).toHaveAttribute(
      'href',
      '/work/exemplo',
    )
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

  it('a miniatura não muda o nome do link do título', () => {
    const item = project()
    renderSlip(
      <ProjectSlip
        project={item}
        index={1}
        href="/work/exemplo"
        labels={labels}
      />,
    )
    // O placeholder repete o título, mas fica fora da árvore: o nome do link
    // continua sendo o de antes, tipo + título.
    const link = screen.getByRole('link', { name: new RegExp(item.title) })
    expect(link).toHaveAccessibleName(`${labels.type}: ${item.title}`)
  })

  it('a miniatura não é link', () => {
    const item = project({
      links: [{ kind: 'repo', href: 'https://github.com/exemplo' }],
    })
    renderSlip(
      <ProjectSlip
        project={item}
        index={1}
        href="/work/exemplo"
        labels={labels}
      />,
    )
    // Título + um link externo; a miniatura não acrescenta alvo.
    expect(screen.getAllByRole('link')).toHaveLength(2)
    expect(document.querySelector('[data-motion="thumb"]')).not.toBeNull()
    expect(document.querySelector('a [data-motion="thumb"]')).toBeNull()
  })

  it('preview sem href também tem miniatura', () => {
    const item = project({ status: 'preview' })
    renderSlip(
      <ProjectSlip project={item} index={1} href={null} labels={labels} />,
    )
    expect(document.querySelector('[data-motion="thumb"]')).not.toBeNull()
  })
})
