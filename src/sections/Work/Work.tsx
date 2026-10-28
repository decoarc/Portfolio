import { useEffect, useLayoutEffect, useState } from 'react'
import { useLocation, useNavigationType } from 'react-router'
import { wantsInstantScroll } from '../../app/navigationState.ts'
import type { Locale, Project, SiteContent } from '../../content/types.ts'
import { caseStudyHref, listProjects } from '../../content/publication.ts'
import { ProjectSlip } from '../../components/ProjectSlip/ProjectSlip.tsx'
import { SectionHead } from '../../components/SectionHead/SectionHead.tsx'
import { Sheet } from '../../components/Sheet/Sheet.tsx'
import styles from './Work.module.css'

interface WorkProps {
  /** Posição da seção na home: o mesmo número do índice. */
  index: number
  copy: SiteContent['work']
  /** Todos os projetos do locale; rascunhos são removidos aqui. */
  projects: Project[]
  locale: Locale
  labels: {
    projectType: SiteContent['projectType']
    links: SiteContent['links']
  }
}

const HEADING_ID = 'work-heading'

/** Primeiro gesto que devolve a reação da lista depois do pouso. */
const WAKE_EVENTS = ['pointermove', 'keydown', 'wheel', 'touchstart'] as const

/** Trabalhos selecionados: as lâminas do arquivo, separadas por filetes. */
export function Work({ index, copy, projects, locale, labels }: WorkProps) {
  // Na volta de um case, a ficha pousa em repouso: o cursor parado sobre
  // outra ficha não a esmaece nem desloca o título que chega. A reação volta
  // no primeiro gesto. A primeira renderização é sempre a do HTML
  // pré-renderizado (o estado do histórico sobrevive à recarga e o servidor não
  // o vê); o repouso liga num efeito de layout, antes da pintura, e só em
  // navegação do cliente (PUSH), nunca na carga nem na recarga (POP).
  const { state, key } = useLocation()
  const navigationType = useNavigationType()
  const [settling, setSettling] = useState(false)

  useLayoutEffect(() => {
    if (navigationType === 'PUSH' && wantsInstantScroll(state))
      setSettling(true)
  }, [navigationType, state, key])

  useEffect(() => {
    if (!settling) return
    const wake = () => setSettling(false)
    for (const type of WAKE_EVENTS)
      window.addEventListener(type, wake, { once: true, passive: true })
    return () => {
      for (const type of WAKE_EVENTS) window.removeEventListener(type, wake)
    }
  }, [settling])

  return (
    <Sheet
      tone="sheet"
      id="work"
      labelledBy={HEADING_ID}
      className={styles.work}
    >
      <SectionHead
        index={index}
        headingId={HEADING_ID}
        title={copy.label}
        intro={copy.intro}
      />
      <ol className={styles.list} data-settling={settling || undefined}>
        {listProjects(projects).map((project, position) => (
          <ProjectSlip
            key={project.slug}
            project={project}
            index={position + 1}
            href={caseStudyHref(locale, project)}
            labels={{
              type: labels.projectType[project.type],
              preview: copy.previewNote,
              noCapture: copy.noCapture,
              links: labels.links,
            }}
          />
        ))}
      </ol>
    </Sheet>
  )
}
