import { useState } from 'react'
import type { Server } from '../../store/serverStore'

interface EnvSidePickerProps {
  label: string
  servers: Server[]
  loading: boolean
  error: string | null
  onLoad: (serverId: string, path: string) => void
}

export function EnvSidePicker({ label, servers, loading, error, onLoad }: EnvSidePickerProps): JSX.Element {
  const [serverId, setServerId] = useState('')
  const [path, setPath] = useState('')

  return (
    <div className="flex flex-col gap-1 rounded border border-neutral-800 p-2">
      <span className="text-xs font-medium uppercase text-neutral-500">{label}</span>
      <select
        value={serverId}
        onChange={(e) => setServerId(e.target.value)}
        className="rounded border border-neutral-700 bg-neutral-950 px-2 py-1 text-xs text-neutral-100"
      >
        <option value="">Select a server…</option>
        {servers.map((server) => (
          <option key={server.id} value={server.id}>
            {server.name}
          </option>
        ))}
      </select>
      <input
        value={path}
        onChange={(e) => setPath(e.target.value)}
        placeholder="/path/to/.env"
        className="rounded border border-neutral-700 bg-neutral-950 px-2 py-1 text-xs text-neutral-100"
      />
      <button
        disabled={!serverId || !path || loading}
        onClick={() => onLoad(serverId, path)}
        className="rounded bg-neutral-800 px-2 py-1 text-xs text-neutral-200 hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {loading ? 'Loading…' : 'Load'}
      </button>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
}
