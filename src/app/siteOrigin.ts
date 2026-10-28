/** Valida o valor de `VITE_SITE_ORIGIN`: URL `http(s)` absoluta, sem barra final. */
export function resolveSiteOrigin(value: string | undefined): string {
  const hint =
    'Defina VITE_SITE_ORIGIN com a origem absoluta do site, por exemplo https://exemplo.dev (veja .env.development)'
  if (!value) throw new Error(`VITE_SITE_ORIGIN ausente. ${hint}`)
  let url: URL
  try {
    url = new URL(value)
  } catch {
    throw new Error(`VITE_SITE_ORIGIN inválida: "${value}". ${hint}`)
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error(`VITE_SITE_ORIGIN deve ser http(s): "${value}". ${hint}`)
  }
  return value.replace(/\/+$/, '')
}

export function siteOrigin(): string {
  return resolveSiteOrigin(import.meta.env.VITE_SITE_ORIGIN)
}
