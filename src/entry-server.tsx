/**
 * Entrada do prerender (`vite build --ssr`): renderiza uma URL do app em HTML
 * e reexporta o que `scripts/prerender.ts` precisa para montar cada página.
 * Não importa `main.tsx`: rolagem suave e afins são só do cliente.
 */
import './styles/fonts.css'
import '@fontsource-variable/instrument-sans'
import '@fontsource-variable/geist-mono'
import './styles/tokens.css'
import './styles/global.css'
import './motion/titleFlight.css'
import { StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
import {
  createStaticHandler,
  createStaticRouter,
  StaticRouterProvider,
} from 'react-router'
import { createRoutes } from './app/routes.tsx'
import { siteOrigin } from './app/siteOrigin.ts'
import { BASE_PATH } from './lib/basePath.ts'

export { ENTRANCE_EARLY_SCRIPT } from './app/entranceEarly.ts'
export { renderHeadTags, routeHead } from './app/head.ts'
export { prerenderRoutes } from './app/prerenderRoutes.ts'
export { siteOrigin } from './app/siteOrigin.ts'
export { contentByLocale } from './content/index.ts'
export { htmlLang } from './lib/locale.ts'

/** HTML do `#root` para `url` (caminho do app, como `/pt/work/x`). */
export async function render(url: string): Promise<string> {
  const handler = createStaticHandler(createRoutes(), {
    basename: BASE_PATH || '/',
  })
  // `url` não tem o prefixo do site: ele entra aqui, como no navegador.
  const origin = new URL(siteOrigin()).origin
  const context = await handler.query(new Request(origin + BASE_PATH + url))
  if (context instanceof Response) {
    throw new Error(`render(${url}): o router respondeu ${context.status}`)
  }
  const router = createStaticRouter(handler.dataRoutes, context)
  // Sem loaders, não há dados a hidratar: `hydrate={false}` evita o
  // `<script>` inline do router (que o CSP barraria).
  return renderToString(
    <StrictMode>
      <StaticRouterProvider router={router} context={context} hydrate={false} />
    </StrictMode>,
  )
}
