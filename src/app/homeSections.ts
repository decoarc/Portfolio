import type { HomeSectionId, SiteContent } from '../content/types.ts'

/**
 * Seções que a home de fato renderiza, na ordem da página. O número de cada
 * uma é a sua posição aqui mais um — o mesmo no índice (Release) e no
 * cabeçalho da seção.
 */
export function homeSections(site: SiteContent): HomeSectionId[] {
  const sections: HomeSectionId[] = ['work', 'approach', 'about']
  if (site.interests.items.length > 0) sections.push('interests')
  sections.push('contact')
  return sections
}
