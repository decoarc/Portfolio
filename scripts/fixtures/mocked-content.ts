/**
 * Fixture de `assert-no-mock.test.ts`: um único `mock: true`, em
 * `pt.projects[0]`.
 */
export const contentByLocale = {
  en: {
    site: { approach: { items: [{ title: 'Real', body: 'Real' }] } },
    projects: [{ slug: 'real-project' }],
  },
  pt: {
    site: { approach: { items: [{ title: 'Real', body: 'Real' }] } },
    projects: [{ slug: 'invented-project', mock: true }],
  },
}
