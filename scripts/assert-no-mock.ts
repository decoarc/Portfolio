/**
 * Trava de build: falha enquanto a árvore de conteúdo tiver item `mock: true`.
 *
 * Uso: node scripts/assert-no-mock.ts [caminho-do-modulo] [--allow-mock]
 *
 * O módulo (padrão `src/content/index.ts`, relativo ao cwd) precisa exportar
 * `contentByLocale`. `--allow-mock` ou `ALLOW_MOCK=1` listam os mocks, avisam
 * e saem com 0 — é o caminho do `build:preview`.
 */
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { findMockPaths } from '../src/lib/mock.ts'

const args = process.argv.slice(2)
const allowMock =
  args.includes('--allow-mock') || process.env.ALLOW_MOCK === '1'
const modulePath =
  args.find((arg) => !arg.startsWith('--')) ?? 'src/content/index.ts'

const moduleUrl = pathToFileURL(path.resolve(process.cwd(), modulePath)).href
const loaded = (await import(moduleUrl)) as { contentByLocale?: unknown }

if (loaded.contentByLocale === undefined) {
  console.error(`assert-no-mock: ${modulePath} não exporta contentByLocale`)
  process.exit(2)
}

const mockPaths = findMockPaths(loaded.contentByLocale)

if (mockPaths.length > 0) {
  console.error(`assert-no-mock: ${mockPaths.length} item(ns) com mock: true`)
  for (const mockPath of mockPaths) console.error(`  ${mockPath}`)

  if (allowMock) {
    console.error(
      'assert-no-mock: mock permitido (--allow-mock / ALLOW_MOCK=1)',
    )
  } else {
    console.error(
      'assert-no-mock: build bloqueado. Troque o conteúdo inventado ou use pnpm build:preview.',
    )
    process.exit(1)
  }
}
