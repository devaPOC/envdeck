import { useEffect, useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { DockerContainer } from './DockerPanel'

const PAGE_SIZE = 100

interface DockerLogsModalProps {
  serverId: string
  container: DockerContainer
  onClose: () => void
}

export function DockerLogsModal({ serverId, container, onClose }: DockerLogsModalProps): JSX.Element {
  const [allLines, setAllLines] = useState<string[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    window.electronAPI.docker
      .logs(serverId, container.id)
      .then((text) => {
        if (cancelled) return
        const lines = text === '' ? [] : text.split('\n')
        if (lines.length > 0 && lines[lines.length - 1] === '') lines.pop()
        setAllLines(lines)
        setPage(1)
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

  const totalPages = allLines ? Math.max(1, Math.ceil(allLines.length / PAGE_SIZE)) : 1

  // Page 1 is the most recent PAGE_SIZE lines (the end of the array), so
  // higher page numbers move further back in time.
  const pageLines = useMemo(() => {
    if (!allLines) return []
    const end = allLines.length - (page - 1) * PAGE_SIZE
    const start = Math.max(0, end - PAGE_SIZE)
    return allLines.slice(start, end)
  }, [allLines, page])

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
              {pageLines.length > 0 ? pageLines.join('\n') : 'No log output'}
            </pre>
          )}
        </div>

        <div className="flex items-center justify-between pt-3">
          <button
            disabled={loading || page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="flex items-center gap-1 rounded px-2 py-1 text-xs text-neutral-300 hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft size={12} /> Previous 100
          </button>
          <span className="text-xs text-neutral-500">
            Page {page} of {totalPages}
          </span>
          <button
            disabled={loading || page <= 1}
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
