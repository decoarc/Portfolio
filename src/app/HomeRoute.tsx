import { useContent } from './LocaleContext.ts'

/** As seções da home entram nas Tasks 4 a 6. */
export function HomeRoute() {
  const { site } = useContent()
  return <title>{site.meta.homeTitle}</title>
}
