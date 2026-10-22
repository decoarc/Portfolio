import type { ReactNode } from 'react'
import { useParams } from 'react-router'
import { AppShell } from '@/components/AppShell'
import {
  findProjectBySlug,
  getProjects,
  getSiteContent,
  resolveCaseStudyAccess,
} from '@/content'
import { CaseStudyPage } from '@/pages/CaseStudyPage'
import { HomePage } from '@/pages/HomePage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { ScrollAndFocus } from './ScrollAndFocus'

function ShellLayout({ children }: { children: ReactNode }) {
  const site = getSiteContent('en')
  return (
    <AppShell content={site}>
      <ScrollAndFocus />
      {children}
    </AppShell>
  )
}

export function HomeRoute() {
  const site = getSiteContent('en')
  const projects = getProjects('en')
  return (
    <ShellLayout>
      <HomePage site={site} projects={projects} />
    </ShellLayout>
  )
}

export function CaseStudyRoute() {
  const { slug } = useParams()
  const site = getSiteContent('en')
  const project = findProjectBySlug(getProjects('en'), slug)
  const access = resolveCaseStudyAccess(project)

  if (!project || access === 'unavailable') {
    return (
      <ShellLayout>
        <NotFoundPage site={site} />
      </ShellLayout>
    )
  }

  return (
    <ShellLayout>
      <CaseStudyPage site={site} project={project} access={access} />
    </ShellLayout>
  )
}

export function NotFoundRoute() {
  const site = getSiteContent('en')
  return (
    <ShellLayout>
      <NotFoundPage site={site} />
    </ShellLayout>
  )
}
