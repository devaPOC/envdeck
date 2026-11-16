import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { DockerContainer } from './DockerPanel'

const PAGE_SIZE = 100

interface DockerLogsModalProps {
  serverId: string
  container: DockerContainer
  onClose: () => void
}

export function DockerLogsModal({ serverId, container, onClose }: DockerLogsModalProps): JSX.Element {
  const [page, setPage] = useState(1)
  const [lines, setLines] = useState<string[]>([])
  const [hasOlder, setHasOlder] = useState(true)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    window.electronAPI.docker
      .logs(serverId, container.id, page * PAGE_SIZE)
      .then((text) => {
        if (cancelled) return

        const allLines = text === '' ? [] : text.split('\n')
        if (allLines.length > 0 && allLines[allLines.length - 1] === '') allLines.pop()

        // We fetched the last `page * PAGE_SIZE` lines; the lines already
        // shown by newer pages are the LAST `(page - 1) * PAGE_SIZE` of that
        // fetch, so this page's window is whatever's left before them.
        const alreadyShown = (page - 1) * PAGE_SIZE
        const pageLines = allLines.slice(0, Math.max(0, allLines.length - alreadyShown))

        setLines(pageLines)
        setHasOlder(pageLines.length === PAGE_SIZE)
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
  }, [serverId, container.id, page])

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
              {lines.length > 0 ? lines.join('\n') : 'No log output'}
            </pre>
          )}
        </div>

        <div className="flex items-center justify-between pt-3">
          <button
            disabled={loading || !hasOlder}
            onClick={() => setPage((p) => p + 1)}
            className="flex items-center gap-1 rounded px-2 py-1 text-xs text-neutral-300 hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft size={12} /> Previous 100
          </button>
          <span className="text-xs text-neutral-500">
            {page === 1 ? 'Most recent' : `${(page - 1) * PAGE_SIZE} lines back`}
          </span>
          <button
            disabled={loading || page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="flex items-center gap-1 rounded px-2 py-1 text-xs text-neutral-300 hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next 100 <ChevronRight size={12} />
          </button>
        </div>
      </div>
    </div>
  )
}
