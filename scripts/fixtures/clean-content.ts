/**
 * Fixture de `assert-no-mock.test.ts`: árvore sem nenhum `mock: true`.
 * Só a forma importa para a trava; não precisa ser um `LocaleContent` completo.
 */
export const contentByLocale = {
  en: {
    site: { approach: { items: [{ title: 'Real', body: 'Real' }] } },
    projects: [{ slug: 'real-project', mock: false }],
  },
  pt: {
    site: { approach: { items: [{ title: 'Real', body: 'Real' }] } },
    projects: [{ slug: 'real-project' }],
  },
}
