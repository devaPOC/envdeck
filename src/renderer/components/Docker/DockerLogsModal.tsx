import { useEffect, useState } from 'react'
import type { DockerContainer } from './DockerPanel'

interface DockerLogsModalProps {
  serverId: string
  container: DockerContainer
  onClose: () => void
}

export function DockerLogsModal({ serverId, container, onClose }: DockerLogsModalProps): JSX.Element {
  const [logs, setLogs] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    window.electronAPI.docker
      .logs(serverId, container.id)
      .then((text) => {
        if (!cancelled) setLogs(text)
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Could not fetch logs')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [serverId, container.id])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="flex max-h-[80vh] w-[640px] flex-col rounded-lg border border-neutral-800 bg-neutral-900 p-4">
        <div className="flex items-center justify-between pb-2">
          <h2 className="text-sm font-semibold text-neutral-100">Logs — {container.name}</h2>
          <button onClick={onClose} className="text-neutral-500 hover:text-neutral-200">
            ×
          </button>
        </div>
        <div className="flex-1 overflow-auto rounded bg-neutral-950 p-3">
          {loading && <p className="text-sm text-neutral-500">Loading…</p>}
          {error && <p className="text-sm text-red-400">{error}</p>}
          {!loading && !error && (
            <pre className="whitespace-pre-wrap break-all font-mono text-xs text-neutral-300">
              {logs || 'No log output'}
            </pre>
          )}
        </div>
      </div>
    </div>
  )
}
