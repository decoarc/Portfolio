/**
 * Prefixo de caminho do site (`base` do Vite): `/` em dev e Cloudflare Pages,
 * `/Portfolio/` no GitHub Pages. Vem de `VITE_BASE_PATH` no `vite.config.ts`.
 */

/** Sem barra final, para concatenar com caminhos do app (`/pt`). '' quando a raiz. */
export const BASE_PATH = import.meta.env.BASE_URL.replace(/\/$/, '')

/** Caminho de um arquivo de `public/` (`/images/x.webp`) com o prefixo do site. */
export function assetUrl(path: string): string {
  return `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`
}
