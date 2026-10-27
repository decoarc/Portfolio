import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { siteEn } from '../../content/en/site.ts'
import type { Project } from '../../content/types.ts'
import { ProjectThumb } from './ProjectThumb.tsx'

function project(overrides: Partial<Project> = {}): Project {
  return {
    slug: 'exemplo',
    title: 'Projeto Exemplo',
    type: 'verified',
    status: 'published',
    summary: 'Resumo do projeto.',
    role: 'Dev',
    year: '2025',
    stack: ['React'],
    sections: [],
    links: [],
    ...overrides,
  }
}

const cover = {
  src: '/images/projects/exemplo.webp',
  alt: 'Captura do exemplo',
  width: 1600,
  height: 1200,
}

function renderThumb(item: Project) {
  return render(
    <ProjectThumb
      project={item}
      typeLabel={siteEn.projectType.verified}
      noCapture={siteEn.work.noCapture}
    />,
  )
}

describe('ProjectThumb', () => {
  it('com cover: img da miniatura, alt vazio, lazy', () => {
    const { container } = renderThumb(
      project({
        cover: { ...cover, thumbSrc: '/images/projects/exemplo-800.webp' },
      }),
    )
    const img = container.querySelector('img')
    expect(img).toHaveAttribute('src', '/images/projects/exemplo-800.webp')
    expect(img).toHaveAttribute('alt', '')
    expect(img).toHaveAttribute('loading', 'lazy')
    expect(img).toHaveAttribute('decoding', 'async')
    expect(img).toHaveAttribute('width', '800')
    expect(img).toHaveAttribute('height', '600')
    expect(img).toHaveAttribute('data-motion', 'thumb')
  })

  it('sem thumbSrc usa cover.src', () => {
    const { container } = renderThumb(project({ cover }))
    const img = container.querySelector('img')
    expect(img).toHaveAttribute('src', cover.src)
    expect(img).toHaveAttribute('width', String(cover.width))
    expect(img).toHaveAttribute('height', String(cover.height))
  })

  it('sem cover: placeholder com tipo · sem captura e título', () => {
    const item = project()
    const { container } = renderThumb(item)
    expect(container.querySelector('img')).toBeNull()
    const placeholder = container.querySelector('[data-motion="thumb"]')
    expect(placeholder).not.toBeNull()
    expect(placeholder).toHaveTextContent(
      `${siteEn.projectType.verified} · ${siteEn.work.noCapture}`,
    )
    expect(placeholder).toHaveTextContent(item.title)
  })

  it('raiz aria-hidden', () => {
    const { container } = renderThumb(project())
    expect(container.firstElementChild).toHaveAttribute('aria-hidden', 'true')
  })
})
