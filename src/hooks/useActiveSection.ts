import { useEffect, useState } from 'react'

/**
 * MP-4 — lightweight scroll spy for in-page nav highlighting.
 * Uses native scroll; no scroll-jacking.
 */
export function useActiveSection(sectionIds: readonly string[]): string | null {
  const [activeId, setActiveId] = useState<string | null>(null)
  const idsKey = sectionIds.join('|')

  useEffect(() => {
    const ids = idsKey.split('|').filter(Boolean)
    const nodes = ids
      .map((id) => document.getElementById(id))
      .filter((node): node is HTMLElement => Boolean(node))

    if (nodes.length === 0) {
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (a, b) =>
              (b.intersectionRatio ?? 0) - (a.intersectionRatio ?? 0),
          )

        if (visible[0]?.target.id) {
          setActiveId(visible[0].target.id)
        }
      },
      {
        rootMargin: '-30% 0px -55% 0px',
        threshold: [0.1, 0.25, 0.5],
      },
    )

    for (const node of nodes) {
      observer.observe(node)
    }

    const onHash = () => {
      const hash = window.location.hash.replace(/^#/, '')
      if (hash && ids.includes(hash)) {
        setActiveId(hash)
      }
    }
    onHash()
    window.addEventListener('hashchange', onHash)

    return () => {
      observer.disconnect()
      window.removeEventListener('hashchange', onHash)
    }
  }, [idsKey])

  return activeId
}
