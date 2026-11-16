export interface EnvEntry {
  value: string
  lineIndex: number
}

export type EnvEntries = Record<string, EnvEntry>

export function parseEnv(content: string): { lines: string[]; entries: EnvEntries } {
  const lines = content.split('\n')
  const entries: EnvEntries = {}

  lines.forEach((line, lineIndex) => {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) return
    const eq = trimmed.indexOf('=')
    if (eq === -1) return
    const key = trimmed.slice(0, eq).trim()
    const value = trimmed.slice(eq + 1).trim()
    if (key) entries[key] = { value, lineIndex }
  })

  return { lines, entries }
}

export type DiffStatus = 'onlyA' | 'onlyB' | 'different' | 'matching'

export interface DiffRow {
  key: string
  valueA?: string
  valueB?: string
  status: DiffStatus
}

export function diffEnv(a: EnvEntries, b: EnvEntries): DiffRow[] {
  const keys = Array.from(new Set([...Object.keys(a), ...Object.keys(b)])).sort()

  return keys.map((key) => {
    const inA = key in a
    const inB = key in b
    let status: DiffStatus

    if (inA && !inB) status = 'onlyA'
    else if (!inA && inB) status = 'onlyB'
    else if (a[key].value !== b[key].value) status = 'different'
    else status = 'matching'

    return { key, valueA: a[key]?.value, valueB: b[key]?.value, status }
  })
}

export function setEnvValue(
  lines: string[],
  entries: EnvEntries,
  key: string,
  value: string
): string[] {
  const existing = entries[key]
  const newLines = [...lines]

  if (existing) {
    newLines[existing.lineIndex] = `${key}=${value}`
    return newLines
  }

  // Append a new entry, reusing a trailing blank line if there is one so we
  // don't leave a gap in the middle of the file.
  if (newLines.length > 0 && newLines[newLines.length - 1] === '') {
    newLines[newLines.length - 1] = `${key}=${value}`
  } else {
    newLines.push(`${key}=${value}`)
  }
  return newLines
}
