/**
 * Prerender: depois dos dois `vite build` (cliente em `dist/`, servidor em
 * `dist-ssr/`), grava em `dist/` um HTML pronto por rota, no arquivo que o
 * Cloudflare Pages serve (design §5.2). Usa `dist/index.html` como molde.
 *
 * Falha (exit 1) quando uma rota que não é 404 renderiza o 404, quando falta
 * `<h1>`, `<title>` ou `description`, ou quando `routeHead` lança (por
 * exemplo, `VITE_SITE_ORIGIN` ausente no build).
 */
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

type Locale = 'en' | 'pt'
type RouteKey = { locale: Locale; page: 'home' | 'case' | 'notFound' }

/** Forma do bundle `dist-ssr/entry-server.js` (ver `src/entry-server.tsx`). */
interface ServerEntry {
  render(url: string): Promise<string>
  prerenderRoutes(
    content: unknown,
  ): { key: RouteKey; url: string; file: string }[]
  routeHead(key: RouteKey, content: unknown, origin: string): unknown
  renderHeadTags(head: unknown): string
  siteOrigin(): string
  htmlLang(locale: Locale): string
  contentByLocale: Record<Locale, { site: { notFound: { title: string } } }>
  ENTRANCE_EARLY_SCRIPT: string
}

const root = process.cwd()
const distDir = path.resolve(root, 'dist')
const entryPath = path.resolve(root, 'dist-ssr/entry-server.js')

function fail(message: string): never {
  console.error(`prerender: ${message}`)
  process.exit(1)
}

function decode(text: string): string {
  return text
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
}

/** Texto de cada `<h1>` do HTML, sem tags internas. */
function h1Texts(html: string): string[] {
  return [...html.matchAll(/<h1[\s>][\s\S]*?<\/h1>/g)].map((m) =>
    decode(m[0].replace(/<[^>]*>/g, '')).trim(),
  )
}

const templatePath = path.join(distDir, 'index.html')
if (!fs.existsSync(templatePath)) fail(`molde ausente: ${templatePath}`)
if (!fs.existsSync(entryPath)) fail(`bundle SSR ausente: ${entryPath}`)

const template = fs.readFileSync(templatePath, 'utf8')
for (const mark of ['<html lang="en">', '<!--head-->', '<!--app-->']) {
  if (!template.includes(mark)) fail(`o molde não tem ${mark}`)
}

const entry = (await import(pathToFileURL(entryPath).href)) as ServerEntry
const { contentByLocale } = entry

let origin: string
try {
  origin = entry.siteOrigin()
} catch (error) {
  fail((error as Error).message)
}

const routes = entry.prerenderRoutes(contentByLocale)
const pages: { file: string; html: string }[] = []

for (const route of routes) {
  let headTags: string
  try {
    headTags = entry.renderHeadTags(
      entry.routeHead(route.key, contentByLocale, origin),
    )
  } catch (error) {
    fail(`${route.url}: routeHead falhou: ${(error as Error).message}`)
  }
  const app = await entry.render(route.url)

  const headings = h1Texts(app)
  if (headings.length === 0) fail(`${route.url}: o HTML não tem <h1>`)
  const notFoundTitle = contentByLocale[route.key.locale].site.notFound.title
  if (route.key.page !== 'notFound' && headings.includes(notFoundTitle)) {
    fail(`${route.url}: renderizou o 404 no lugar do conteúdo`)
  }
  if (!/<title>[^<]+<\/title>/.test(headTags)) {
    fail(`${route.url}: o head não tem <title>`)
  }
  if (!/name="description" content="[^"]+"/.test(headTags)) {
    fail(`${route.url}: o head não tem description`)
  }

  // Só nas homes: esconde o nome antes do JS para a entrada não piscar
  // (design §5.3). O texto vai exato, porque o CSP usa o hash dele.
  if (route.key.page === 'home') {
    headTags = `<script>${entry.ENTRANCE_EARLY_SCRIPT}</script>\n${headTags}`
  }

  // Funções de substituição: `$` no conteúdo não vira padrão de replace.
  const html = template
    .replace(
      '<html lang="en">',
      () => `<html lang="${entry.htmlLang(route.key.locale)}">`,
    )
    .replace('<!--head-->', () => headTags)
    .replace('<!--app-->', () => app)
  pages.push({ file: route.file, html })
}

// Só grava depois de todas as rotas passarem: o molde `index.html` é
// sobrescrito pela home.
for (const { file, html } of pages) {
  const target = path.join(distDir, ...file.split('/'))
  fs.mkdirSync(path.dirname(target), { recursive: true })
  fs.writeFileSync(target, html)
}

console.log(`prerender: ${pages.length} páginas em dist/`)
for (const { file } of pages) console.log(`  ${file}`)
