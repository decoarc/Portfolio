import { Hero } from '../sections/Hero/index.ts'
import { Release } from '../sections/Release/index.ts'
import { homeSections } from './homeSections.ts'
import { useContent } from './LocaleContext.ts'

/** As seções numeradas entram nas Tasks 5 e 6; o índice já lista todas. */
export function HomeRoute() {
  const { site } = useContent()
  return (
    <>
      <title>{site.meta.homeTitle}</title>
      <Hero person={site.person} copy={site.hero} />
      <Release copy={site.release} sections={homeSections(site)} />
    </>
  )
}
