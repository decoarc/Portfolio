/**
 * `pnpm models`: transforma cada `.glb` de `models/` numa nuvem de pontos em
 * `public/models/` (o que o site baixa) e escreve `manifest.json` com a ordem
 * dos cliques no cubo do Hero (alfabética, pelo nome do arquivo). Nuvens de
 * modelos que saíram da pasta são apagadas. Rodar de novo sempre que a pasta
 * mudar e versionar o resultado.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { encodeCloud, readTriangles, samplePointCloud } from './glb.ts'

/**
 * Pontos por nuvem: o cubo do Hero chega a 6 × 26² = 4056 pontos, e cada forma
 * precisa de pelo menos tantos quanto ele (o site usa um prefixo da nuvem).
 */
export const CLOUD_POINTS = 4096

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const source = path.join(root, 'models')
const target = path.join(root, 'public', 'models')

const files = fs
  .readdirSync(source)
  .filter((name) => name.toLowerCase().endsWith('.glb'))
  .sort((a, b) => a.localeCompare(b))

fs.mkdirSync(target, { recursive: true })
const written: string[] = []
let failed = false
for (const file of files) {
  const out = `${path.basename(file, path.extname(file))}.bin`
  try {
    const triangles = readTriangles(fs.readFileSync(path.join(source, file)))
    const cloud = encodeCloud(samplePointCloud(triangles, CLOUD_POINTS))
    fs.writeFileSync(path.join(target, out), cloud)
    written.push(out)
    console.log(
      `${file}: ${triangles.length / 9} triângulos → ${out} (${(cloud.byteLength / 1024).toFixed(1)} KB)`,
    )
  } catch (error) {
    failed = true
    console.error(`${file}: ${(error as Error).message}`)
  }
}

for (const name of fs.readdirSync(target))
  if (name.endsWith('.bin') && !written.includes(name)) {
    fs.rmSync(path.join(target, name))
    console.log(`removida: ${name}`)
  }
fs.writeFileSync(
  path.join(target, 'manifest.json'),
  `${JSON.stringify({ points: CLOUD_POINTS, models: written }, null, 2)}\n`,
)
console.log(`manifest.json: ${written.length} modelo(s)`)
if (failed) process.exit(1)
