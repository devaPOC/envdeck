import { useEffect, useState } from 'react'
import { ArrowUp, File, Folder } from 'lucide-react'
import type { SftpEntry } from '../FileTree/types'
import { sortEntries } from '../FileTree/sortEntries'
import { joinPath } from '../../utils/path'

interface RemoteFileBrowserModalProps {
  serverId: string
  onSelect: (path: string) => void
  onClose: () => void
}

export function RemoteFileBrowserModal({
  serverId,
  onSelect,
  onClose
}: RemoteFileBrowserModalProps): JSX.Element {
  const [currentPath, setCurrentPath] = useState<string | null>(null)
  const [entries, setEntries] = useState<SftpEntry[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    window.electronAPI.sftp
      .home(serverId)
      .then((home) => {
        if (!cancelled) setCurrentPath(home)
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Could not open the home directory')
          setLoading(false)
        }
      })
    return () => {
      cancelled = true
    }
  }, [serverId])

  useEffect(() => {
    if (currentPath === null) return
    let cancelled = false
    setLoading(true)
    setError(null)

    window.electronAPI.sftp
      .listDir(serverId, currentPath)
      .then((list) => {
        if (!cancelled) setEntries([...list].sort(sortEntries))
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Could not read this directory')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [serverId, currentPath])

  function goUp(): void {
    if (!currentPath || currentPath === '/') return
    const parent = currentPath.split('/').slice(0, -1).join('/') || '/'
    setCurrentPath(parent)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="flex max-h-[70vh] w-96 flex-col rounded-lg border border-neutral-800 bg-neutral-900 p-4">
        <div className="flex items-center justify-between pb-2">
          <h2 className="truncate text-xs font-mono text-neutral-400">{currentPath ?? 'Loading…'}</h2>
          <button onClick={onClose} className="shrink-0 text-neutral-500 hover:text-neutral-200">
            ×
          </button>
        </div>
        <button
          onClick={goUp}
          disabled={!currentPath || currentPath === '/'}
          className="mb-2 flex items-center gap-1 self-start rounded px-2 py-1 text-xs text-neutral-400 hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ArrowUp size={12} /> Up
        </button>
        <div className="flex-1 overflow-y-auto rounded border border-neutral-800">
          {loading && <p className="p-2 text-xs text-neutral-500">Loading…</p>}
          {error && <p className="p-2 text-xs text-red-400">{error}</p>}
          {!loading &&
            !error &&
            entries?.map((entry) => (
              <button
                key={entry.name}
                onClick={() => {
                  if (entry.type === 'directory') {
                    setCurrentPath((p) => joinPath(p ?? '/', entry.name))
                  } else {
                    onSelect(joinPath(currentPath ?? '/', entry.name))
                  }
                }}
                className="flex w-full items-center gap-1.5 px-2 py-1 text-left text-xs hover:bg-neutral-800"
              >
                {entry.type === 'directory' ? (
                  <Folder size={12} className="shrink-0 text-blue-400" />
                ) : (
                  <File size={12} className="shrink-0 text-neutral-400" />
                )}
                <span className={`truncate ${entry.isHidden ? 'text-neutral-500' : 'text-neutral-200'}`}>
                  {entry.name}
                </span>
              </button>
            ))}
        </div>
      </div>
    </div>
  )
}
