// @vitest-environment node
import { spawnSync } from 'node:child_process'
import { describe, expect, it } from 'vitest'

const SCRIPT = 'scripts/assert-no-mock.ts'
const CLEAN = 'scripts/fixtures/clean-content.ts'
const MOCKED = 'scripts/fixtures/mocked-content.ts'

// ALLOW_MOCK do ambiente de quem roda os testes não pode vazar para o script
const cleanEnv: NodeJS.ProcessEnv = { ...process.env }
delete cleanEnv.ALLOW_MOCK

function run(args: string[], env: NodeJS.ProcessEnv = cleanEnv) {
  return spawnSync(process.execPath, [SCRIPT, ...args], {
    encoding: 'utf8',
    env,
  })
}

describe('assert-no-mock', () => {
  it('passa com conteúdo limpo', () => {
    const result = run([CLEAN])
    expect(result.stderr).toBe('')
    expect(result.status).toBe(0)
  })

  it('falha e lista o caminho do mock', () => {
    const result = run([MOCKED])
    expect(result.status).toBe(1)
    expect(result.stderr).toContain('pt.projects[0]')
  })

  it('ALLOW_MOCK=1 deixa passar com aviso', () => {
    const result = run([MOCKED], { ...cleanEnv, ALLOW_MOCK: '1' })
    expect(result.status).toBe(0)
    expect(result.stderr).toContain('pt.projects[0]')
    expect(result.stderr).toMatch(/mock permitido/i)
  })

  it('--allow-mock deixa passar', () => {
    const result = run([MOCKED, '--allow-mock'])
    expect(result.status).toBe(0)
    expect(result.stderr).toMatch(/mock permitido/i)
  })
})
