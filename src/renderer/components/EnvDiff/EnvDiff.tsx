import { useState } from 'react'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useServerStore } from '../../store/serverStore'
import { EnvSidePicker } from './EnvSidePicker'
import { parseEnv, diffEnv, setEnvValue } from './envParser'
import type { EnvEntries, DiffRow } from './envParser'

interface SideState {
  serverId: string
  path: string
  lines: string[] | null
  entries: EnvEntries
  loading: boolean
  error: string | null
  dirty: boolean
  saving: boolean
  saveError: string | null
}

const EMPTY_SIDE: SideState = {
  serverId: '',
  path: '',
  lines: null,
  entries: {},
  loading: false,
  error: null,
  dirty: false,
  saving: false,
  saveError: null
}

const STATUS_STYLE: Record<DiffRow['status'], string> = {
  matching: 'border-green-900 bg-green-950/30',
  different: 'border-yellow-900 bg-yellow-950/30',
  onlyA: 'border-red-900 bg-red-950/30',
  onlyB: 'border-blue-900 bg-blue-950/30'
}

export function EnvDiff(): JSX.Element {
  const servers = useServerStore((state) => state.servers.filter((s) => s.status === 'connected'))

  const [a, setA] = useState<SideState>(EMPTY_SIDE)
  const [b, setB] = useState<SideState>(EMPTY_SIDE)

  async function load(side: 'A' | 'B', serverId: string, path: string): Promise<void> {
    const setSide = side === 'A' ? setA : setB
    setSide((prev) => ({ ...prev, serverId, path, loading: true, error: null }))
    try {
      const content = await window.electronAPI.sftp.readFile(serverId, path)
      const { lines, entries } = parseEnv(content)
      setSide((prev) => ({ ...prev, lines, entries, loading: false, dirty: false, saveError: null }))
    } catch (err) {
      setSide((prev) => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : 'Could not read this file'
      }))
    }
  }

  function applyCopy(target: 'A' | 'B', key: string, value: string): void {
    const setSide = target === 'A' ? setA : setB
    setSide((prev) => {
      if (prev.lines === null) return prev
      const lines = setEnvValue(prev.lines, prev.entries, key, value)
      const { entries } = parseEnv(lines.join('\n'))
      return { ...prev, lines, entries, dirty: true }
    })
  }

  async function save(side: 'A' | 'B'): Promise<void> {
    const state = side === 'A' ? a : b
    const setSide = side === 'A' ? setA : setB
    if (!state.lines || !state.serverId || !state.path) return

    setSide((prev) => ({ ...prev, saving: true, saveError: null }))
    try {
      await window.electronAPI.sftp.writeFile(state.serverId, state.path, state.lines.join('\n'))
      setSide((prev) => ({ ...prev, saving: false, dirty: false }))
    } catch (err) {
      setSide((prev) => ({
        ...prev,
        saving: false,
        saveError: err instanceof Error ? err.message : 'Could not save this file'
      }))
    }
  }

  const rows = a.lines !== null && b.lines !== null ? diffEnv(a.entries, b.entries) : []

  const summary = rows.reduce(
    (acc, row) => {
      if (row.status === 'matching') acc.matching++
      else if (row.status === 'different') acc.different++
      else acc.missing++
      return acc
    },
    { matching: 0, different: 0, missing: 0 }
  )

  return (
    <div className="flex flex-col gap-3 overflow-y-auto p-2 text-sm">
      <EnvSidePicker
        label="Server A"
        servers={servers}
        loading={a.loading}
        error={a.error}
        onLoad={(serverId, path) => void load('A', serverId, path)}
      />
      <EnvSidePicker
        label="Server B"
        servers={servers}
        loading={b.loading}
        error={b.error}
        onLoad={(serverId, path) => void load('B', serverId, path)}
      />

      {a.lines !== null && b.lines !== null && (
        <>
          <p className="text-xs text-neutral-400">
            {summary.missing} missing, {summary.different} different, {summary.matching} matching
          </p>

          {(a.dirty || b.dirty) && (
            <div className="flex items-center gap-2">
              {a.dirty && (
                <button
                  disabled={a.saving}
                  onClick={() => void save('A')}
                  className="rounded bg-blue-600 px-2 py-1 text-xs text-white hover:bg-blue-500 disabled:opacity-50"
                >
                  {a.saving ? 'Saving…' : 'Save A'}
                </button>
              )}
              {b.dirty && (
                <button
                  disabled={b.saving}
                  onClick={() => void save('B')}
                  className="rounded bg-blue-600 px-2 py-1 text-xs text-white hover:bg-blue-500 disabled:opacity-50"
                >
                  {b.saving ? 'Saving…' : 'Save B'}
                </button>
              )}
            </div>
          )}
          {a.saveError && <p className="text-xs text-red-400">A: {a.saveError}</p>}
          {b.saveError && <p className="text-xs text-red-400">B: {b.saveError}</p>}

          <div className="flex flex-col gap-1">
            {rows.map((row) => (
              <div key={row.key} className={`rounded border p-2 ${STATUS_STYLE[row.status]}`}>
                <p className="truncate font-mono text-xs font-medium text-neutral-200">{row.key}</p>
                <p className="truncate text-xs text-neutral-400">
                  A: {row.valueA ?? <span className="italic text-neutral-600">missing</span>}
                </p>
                <p className="truncate text-xs text-neutral-400">
                  B: {row.valueB ?? <span className="italic text-neutral-600">missing</span>}
                </p>
                {row.status !== 'matching' && (
                  <div className="mt-1 flex gap-3">
                    {row.valueA !== undefined && (
                      <button
                        onClick={() => applyCopy('B', row.key, row.valueA as string)}
                        title="Copy A's value to B"
                        className="flex items-center gap-1 text-xs text-neutral-400 hover:text-neutral-100"
                      >
                        <ArrowRight size={11} /> to B
                      </button>
                    )}
                    {row.valueB !== undefined && (
                      <button
                        onClick={() => applyCopy('A', row.key, row.valueB as string)}
                        title="Copy B's value to A"
                        className="flex items-center gap-1 text-xs text-neutral-400 hover:text-neutral-100"
                      >
                        <ArrowLeft size={11} /> to A
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
