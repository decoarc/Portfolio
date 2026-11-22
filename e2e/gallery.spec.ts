import { expect, test } from '@playwright/test'

/**
 * A galeria: a home mostra só os 3 primeiros projetos e o "View all" leva a
 * /projects, com todos. O case de um projeto que só está na galeria volta
 * para o cartão dele lá, não para a home.
 */
test('a home mostra 3 projetos e "View all" abre a galeria com todos', async ({
  page,
}) => {
  await page.goto('/')
  await expect(page.locator('#work [data-motion="slip"]')).toHaveCount(3)
  await page.getByRole('link', { name: /^View all/ }).click()
  await expect(page).toHaveURL(/\/projects$/)
  await expect(
    page.getByRole('heading', { level: 1, name: 'Personal projects' }),
  ).toBeFocused()
  await expect(page.locator('[data-motion="card"]')).toHaveCount(4)
})

test('o case fora da home volta para o cartão na galeria', async ({ page }) => {
  await page.goto('/projects')
  await page.locator('#work-portfolio a[data-anchor-focus]').click()
  await expect(page).toHaveURL(/\/work\/portfolio$/)
  await page.getByRole('link', { name: 'Back to personal projects' }).click()
  await expect(page).toHaveURL(/\/projects#work-portfolio$/)
  await expect(page.locator('#work-portfolio')).toBeInViewport()
  await expect(
    page.locator('#work-portfolio a[data-anchor-focus]'),
  ).toBeFocused()
})

test('/pt/projects direto fica em português, com o voltar para /pt', async ({
  page,
}) => {
  await page.goto('/pt/projects')
  await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR')
  await expect(
    page.getByRole('heading', { level: 1, name: 'Projetos pessoais' }),
  ).toBeVisible()
  await expect(
    page.getByRole('link', { name: 'Voltar ao início' }),
  ).toHaveAttribute('href', '/pt#work')
})
