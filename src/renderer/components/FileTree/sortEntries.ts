import type { SftpEntry } from './types'

export function sortEntries(a: SftpEntry, b: SftpEntry): number {
  if (a.type !== b.type) return a.type === 'directory' ? -1 : 1
  return a.name.localeCompare(b.name)
}
