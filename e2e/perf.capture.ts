import { test, type Browser } from '@playwright/test'
import fs from 'node:fs'

/**
 * Laboratório de performance (design §8), com o método de
 * `docs/m5/PERFORMANCE_NOTES.md`: contexto novo por rota, cache desligado,
 * CDP com 150 ms de latência, 180000 B/s de descida e 80000 B/s de subida, e
 * 2,5 s de espera depois do `load`. Mede LCP (com o elemento), CLS e o
 * `transferSize` de cada recurso, e imprime uma tabela markdown.
 *
 * Número de laboratório no preview local, não Core Web Vitals de campo. INP
 * não é medido. Com `PERF_JSON=<arquivo>`, grava também o resultado em JSON
 * (para tirar a mediana de várias rodadas).
 */
const ROUTES = [
  { path: '/', width: 390, height: 844 },
  { path: '/pt', width: 1440, height: 900 },
  { path: '/pt/work/map-areas', width: 1440, height: 900 },
] as const

interface Measure {
  route: string
  viewport: string
  lcp: number
  lcpElement: string
  cls: number
  transferTotal: number
  resources: { name: string; transferSize: number }[]
}

async function measure(
  browser: Browser,
  baseURL: string,
  route: (typeof ROUTES)[number],
): Promise<Measure> {
  const context = await browser.newContext({
    viewport: { width: route.width, height: route.height },
  })
  const page = await context.newPage()
  const cdp = await context.newCDPSession(page)
  await cdp.send('Network.enable')
  await cdp.send('Network.setCacheDisabled', { cacheDisabled: true })
  await cdp.send('Network.emulateNetworkConditions', {
    offline: false,
    latency: 150,
    downloadThroughput: 180000,
    uploadThroughput: 80000,
  })
  // Observadores antes de qualquer script da página.
  await page.addInitScript(() => {
    const w = window as unknown as {
      __lcp: { time: number; element: string }
      __cls: number
    }
    w.__lcp = { time: 0, element: '' }
    w.__cls = 0
    const describe = (el: Element | null) => {
      if (!el) return '(sem elemento)'
      const src =
        el instanceof HTMLImageElement
          ? ` ${new URL(el.currentSrc || el.src).pathname}`
          : ''
      const text = (el.textContent ?? '').trim().replace(/\s+/g, ' ')
      return `${el.tagName.toLowerCase()}${src}${text ? ` “${text.slice(0, 48)}”` : ''}`
    }
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const lcp = entry as PerformanceEntry & { element: Element | null }
        w.__lcp = { time: entry.startTime, element: describe(lcp.element) }
      }
    }).observe({ type: 'largest-contentful-paint', buffered: true })
    // CLS: maior janela de sessão (1 s entre mudanças, 5 s no máximo).
    let windowValue = 0
    let windowStart = 0
    let last = 0
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const shift = entry as PerformanceEntry & {
          value: number
          hadRecentInput: boolean
        }
        if (shift.hadRecentInput) continue
        const t = entry.startTime
        if (windowValue && t - last < 1000 && t - windowStart < 5000) {
          windowValue += shift.value
        } else {
          windowValue = shift.value
          windowStart = t
        }
        last = t
        w.__cls = Math.max(w.__cls, windowValue)
      }
    }).observe({ type: 'layout-shift', buffered: true })
  })

  await page.goto(baseURL + route.path, { waitUntil: 'load', timeout: 60_000 })
  await page.waitForTimeout(2500)

  const data = await page.evaluate(() => {
    const w = window as unknown as {
      __lcp: { time: number; element: string }
      __cls: number
    }
    const nav = performance.getEntriesByType(
      'navigation',
    )[0] as PerformanceNavigationTiming
    const resources = (
      performance.getEntriesByType('resource') as PerformanceResourceTiming[]
    ).map((r) => ({
      name: new URL(r.name).pathname,
      transferSize: r.transferSize,
    }))
    return {
      lcp: w.__lcp.time,
      lcpElement: w.__lcp.element,
      cls: w.__cls,
      resources: [
        {
          name: new URL(nav.name).pathname + ' (HTML)',
          transferSize: nav.transferSize,
        },
        ...resources,
      ],
    }
  })
  await context.close()
  return {
    route: route.path,
    viewport: `${route.width}×${route.height}`,
    ...data,
    transferTotal: data.resources.reduce((sum, r) => sum + r.transferSize, 0),
  }
}

const kB = (bytes: number) => `${(bytes / 1000).toFixed(1)} kB`

test('perf · LCP, CLS e transferência', async ({ browser, baseURL }) => {
  test.setTimeout(180_000)
  const results: Measure[] = []
  for (const route of ROUTES)
    results.push(await measure(browser, baseURL!, route))

  const lines = [
    '| Rota | Viewport | LCP | Elemento LCP | CLS | Transferência |',
    '| --- | --- | --- | --- | --- | --- |',
    ...results.map(
      (r) =>
        `| \`${r.route}\` | ${r.viewport} | ${Math.round(r.lcp)} ms | ${r.lcpElement} | ${r.cls.toFixed(4)} | ${kB(r.transferTotal)} |`,
    ),
  ]
  for (const r of results) {
    lines.push('', `Recursos de \`${r.route}\`:`, '')
    for (const res of r.resources)
      lines.push(`- ${res.name}: ${kB(res.transferSize)}`)
  }
  console.log(lines.join('\n'))
  if (process.env.PERF_JSON) {
    fs.writeFileSync(process.env.PERF_JSON, JSON.stringify(results, null, 2))
  }
})
