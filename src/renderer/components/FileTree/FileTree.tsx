import { useEffect, useState } from 'react'
import { useServerStore } from '../../store/serverStore'
import { FileTreeNode } from './FileTreeNode'
import type { SftpEntry } from './types'
import { sortEntries } from './sortEntries'

export function FileTree({ serverId }: { serverId: string }): JSX.Element {
  const status = useServerStore(
    (state) => state.servers.find((s) => s.id === serverId)?.status
  )

  const [rootPath, setRootPath] = useState<string | null>(null)
  const [entries, setEntries] = useState<SftpEntry[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status !== 'connected') {
      setRootPath(null)
      setEntries(null)
      return
    }

    let cancelled = false
    setLoading(true)
    setError(null)

    window.electronAPI.sftp
      .home(serverId)
      .then((home) =>
        window.electronAPI.sftp.listDir(serverId, home).then((list) => ({ home, list }))
      )
      .then(({ home, list }) => {
        if (cancelled) return
        setRootPath(home)
        setEntries(list)
      })
      .catch((err) => {
        if (cancelled) return
        setError(err instanceof Error ? err.message : 'Could not read the home directory')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [serverId, status])

  function handleChildRenamed(oldName: string, updated: SftpEntry): void {
    setEntries((prev) => prev?.map((e) => (e.name === oldName ? updated : e)).sort(sortEntries) ?? prev)
  }

  function handleChildDeleted(name: string): void {
    setEntries((prev) => prev?.filter((e) => e.name !== name) ?? prev)
  }

  if (status !== 'connected') {
    return (
      <div className="flex-1 overflow-y-auto border-t border-neutral-800 p-3 text-sm text-neutral-500">
        Connect to this server to browse files.
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex-1 overflow-y-auto border-t border-neutral-800 p-3 text-sm text-neutral-500">
        Loading…
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex-1 overflow-y-auto border-t border-neutral-800 p-3 text-sm text-red-400">
        {error}
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto border-t border-neutral-800 py-1">
      {entries?.map((entry) => (
        <FileTreeNode
          key={entry.name}
          serverId={serverId}
          parentPath={rootPath ?? '/'}
          entry={entry}
          depth={0}
          onRenamed={(updated) => handleChildRenamed(entry.name, updated)}
          onDeleted={() => handleChildDeleted(entry.name)}
        />
      ))}
    </div>
  )
}
