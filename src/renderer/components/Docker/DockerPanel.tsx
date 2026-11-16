import { useEffect, useState } from 'react'
import { FileText, Play, RotateCw, Square } from 'lucide-react'
import { useServerStore } from '../../store/serverStore'
import { DockerLogsModal } from './DockerLogsModal'

export interface DockerContainer {
  id: string
  name: string
  image: string
  status: string
  ports: string
  running: boolean
}

export function DockerPanel({ serverId }: { serverId: string }): JSX.Element {
  const status = useServerStore((state) => state.servers.find((s) => s.id === serverId)?.status)

  const [containers, setContainers] = useState<DockerContainer[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [viewingLogsFor, setViewingLogsFor] = useState<DockerContainer | null>(null)

  async function refresh(): Promise<void> {
    try {
      const list = await window.electronAPI.docker.list(serverId)
      setContainers(list)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not list containers')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (status !== 'connected') {
      setContainers(null)
      return
    }

    setLoading(true)
    void refresh()
    const interval = setInterval(() => void refresh(), 10000)
    return () => clearInterval(interval)
  }, [serverId, status])

  async function handleAction(
    container: DockerContainer,
    action: 'start' | 'stop' | 'restart'
  ): Promise<void> {
    setPendingId(container.id)
    setActionError(null)
    try {
      await window.electronAPI.docker.action(serverId, container.id, action)
      await refresh()
    } catch (err) {
      setActionError(err instanceof Error ? err.message : `Could not ${action} container`)
    } finally {
      setPendingId(null)
    }
  }

  if (status !== 'connected') {
    return (
      <div className="p-3 text-sm text-neutral-500">Connect to this server to see Docker containers.</div>
    )
  }

  if (loading && containers === null) {
    return <div className="p-3 text-sm text-neutral-500">Loading containers…</div>
  }

  if (error) {
    return <div className="p-3 text-sm text-red-400">{error}</div>
  }

  if (!containers || containers.length === 0) {
    return <div className="p-3 text-sm text-neutral-500">No containers found.</div>
  }

  return (
    <div className="flex flex-col gap-2 overflow-y-auto p-2 text-sm">
      {actionError && <p className="px-1 text-xs text-red-400">{actionError}</p>}

      {containers.map((container) => {
        const isPending = pendingId === container.id
        return (
          <div key={container.id} className="flex flex-col gap-1 rounded border border-neutral-800 p-2">
            <div className="flex items-center justify-between gap-2">
              <button
                onClick={() => setViewingLogsFor(container)}
                title="View logs"
                className="truncate text-left font-medium text-neutral-100 hover:underline"
              >
                {container.name}
              </button>
              <span
                className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                  container.running ? 'bg-green-500' : 'bg-neutral-600'
                }`}
              />
            </div>
            <p className="truncate text-xs text-neutral-500">{container.image}</p>
            <p className="truncate text-xs text-neutral-500">{container.status}</p>
            {container.ports && <p className="truncate text-xs text-neutral-500">{container.ports}</p>}

            <div className="flex items-center gap-1 pt-1">
              {container.running ? (
                <button
                  disabled={isPending}
                  onClick={() => void handleAction(container, 'stop')}
                  className="flex items-center gap-1 rounded px-2 py-1 text-xs text-neutral-300 hover:bg-neutral-800 disabled:opacity-40"
                >
                  <Square size={12} /> Stop
                </button>
              ) : (
                <button
                  disabled={isPending}
                  onClick={() => void handleAction(container, 'start')}
                  className="flex items-center gap-1 rounded px-2 py-1 text-xs text-neutral-300 hover:bg-neutral-800 disabled:opacity-40"
                >
                  <Play size={12} /> Start
                </button>
              )}
              <button
                disabled={isPending}
                onClick={() => void handleAction(container, 'restart')}
                className="flex items-center gap-1 rounded px-2 py-1 text-xs text-neutral-300 hover:bg-neutral-800 disabled:opacity-40"
              >
                <RotateCw size={12} /> Restart
              </button>
              <button
                onClick={() => setViewingLogsFor(container)}
                className="flex items-center gap-1 rounded px-2 py-1 text-xs text-neutral-300 hover:bg-neutral-800"
              >
                <FileText size={12} /> Logs
              </button>
            </div>
          </div>
        )
      })}

      {viewingLogsFor && (
        <DockerLogsModal
          serverId={serverId}
          container={viewingLogsFor}
          onClose={() => setViewingLogsFor(null)}
        />
      )}
    </div>
  )
}
