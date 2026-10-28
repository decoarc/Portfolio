import { expect, test } from '@playwright/test'

test('/pt/ direto abre em português', async ({ page }) => {
  await page.goto('/pt/')
  await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR')
})

test('rota inexistente sob /pt dá 404 em português com link para /pt', async ({
  page,
}) => {
  await page.goto('/pt/rota-inexistente')
  await expect(
    page.getByRole('heading', { name: 'Página não encontrada' }),
  ).toBeVisible()
  await expect(
    page.getByRole('link', { name: 'Voltar ao início' }),
  ).toHaveAttribute('href', '/pt')
})

test('recarregar /pt mantém o português', async ({ page }) => {
  await page.goto('/pt')
  await page.reload()
  await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR')
})

test('/pt/work/local-email-client direto e recarregado fica em português', async ({
  page,
}) => {
  await page.goto('/pt/work/local-email-client')
  await page.reload()
  await expect(
    page.getByRole('heading', { level: 1, name: 'Local Email Client' }),
  ).toBeVisible()
  await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR')
})
