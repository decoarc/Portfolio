import { useEffect } from 'react'

/** Sets `document.title` when the route renders. Does not move focus. */
export function useDocumentTitle(title: string): void {
  useEffect(() => {
    document.title = title
  }, [title])
}
