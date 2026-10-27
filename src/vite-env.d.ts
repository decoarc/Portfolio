/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Origem absoluta do site, sem barra final (canonical, hreflang, OG). */
  readonly VITE_SITE_ORIGIN: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
