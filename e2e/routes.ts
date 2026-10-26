/** Rotas e viewports compartilhados pela suíte do Gate 2. */
export const GATE_ROUTES = [
  '/',
  '/pt',
  '/work/token-killer',
  '/pt/work/map-areas',
  '/nao-existe',
  '/pt/nao-existe',
] as const

export const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mobile', width: 390, height: 844 },
] as const
