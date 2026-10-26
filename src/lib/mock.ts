/**
 * Percorre objetos e arrays em profundidade e devolve o caminho de todo objeto
 * com `mock === true`, sem descer dentro dele.
 */
export function findMockPaths(value: unknown, path = ''): string[] {
  if (value === null || typeof value !== 'object') return []
  if (Array.isArray(value)) {
    return value.flatMap((item, index) => findMockPaths(item, `${path}[${index}]`))
  }
  const record = value as Record<string, unknown>
  if (record.mock === true) return [path]
  return Object.entries(record).flatMap(([key, child]) =>
    findMockPaths(child, path === '' ? key : `${path}.${key}`),
  )
}
