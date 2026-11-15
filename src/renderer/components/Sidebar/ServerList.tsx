import { useEffect, useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useServerStore } from '../../store/serverStore'
import type { Server } from '../../store/serverStore'
import { StatusDot } from './StatusDot'
import { AddServerModal } from './AddServerModal'
import type { ServerFormValues } from './AddServerModal'
import { ConfirmDialog } from '../ConfirmDialog'

export function ServerList(): JSX.Element {
  const servers = useServerStore((state) => state.servers)
  const activeServerId = useServerStore((state) => state.activeServerId)
  const setActiveServer = useServerStore((state) => state.setActiveServer)
  const setServers = useServerStore((state) => state.setServers)
  const addServer = useServerStore((state) => state.addServer)
  const updateServer = useServerStore((state) => state.updateServer)
  const removeServer = useServerStore((state) => state.removeServer)
  const setStatus = useServerStore((state) => state.setStatus)

  const [modalMode, setModalMode] = useState<'closed' | 'open'>('closed')
  const [editingServer, setEditingServer] = useState<Server | null>(null)
  const [deletingServer, setDeletingServer] = useState<Server | null>(null)

  useEffect(() => {
    window.electronAPI.servers.list().then((records) => {
      setServers(records.map((record) => ({ ...record, status: 'disconnected' as const })))
    })
  }, [setServers])

  async function handleSave(values: ServerFormValues): Promise<void> {
    if (editingServer) {
      // Host/username/key may have changed — tear down any live connection so it
      // doesn't keep pointing at the old target. The resulting `ssh:status`
      // event will flip the dot back to disconnected.
      await window.electronAPI.ssh.disconnect(editingServer.id)
      const updated = await window.electronAPI.servers.update(editingServer.id, values)
      updateServer(editingServer.id, updated)
    } else {
      const created = await window.electronAPI.servers.add(values)
      addServer({ ...created, status: 'disconnected' })
    }
    setModalMode('closed')
    setEditingServer(null)
  }

  async function handleConnect(server: Server): Promise<void> {
    setActiveServer(server.id)
    if (server.status === 'connecting' || server.status === 'connected') return

    setStatus(server.id, 'connecting')
    try {
      await window.electronAPI.ssh.connect(server.id)
    } catch {
      // The main process already broadcast a human-readable error via ssh:status.
    }
  }

  async function handleConfirmDelete(): Promise<void> {
    if (!deletingServer) return
    await window.electronAPI.ssh.disconnect(deletingServer.id)
    await window.electronAPI.servers.remove(deletingServer.id)
    removeServer(deletingServer.id)
    setDeletingServer(null)
  }

  return (
    <div className="flex flex-col gap-1 p-2">
      <div className="flex items-center justify-between px-1 pb-1">
        <span className="text-xs font-medium uppercase text-neutral-500">Servers</span>
        <button
          onClick={() => setModalMode('open')}
          className="rounded p-1 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-100"
        >
          <Plus size={14} />
        </button>
      </div>

      {servers.map((server) => (
        <div key={server.id}>
          <div
            className={`group flex items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-neutral-800 ${
              activeServerId === server.id ? 'bg-neutral-800' : ''
            }`}
          >
            <button
              onClick={() => handleConnect(server)}
              className="flex flex-1 items-center gap-2 overflow-hidden text-left"
            >
              <StatusDot status={server.status} />
              <span className="truncate">{server.name}</span>
            </button>
            <button
              onClick={() => {
                setEditingServer(server)
                setModalMode('open')
              }}
              className="hidden rounded p-1 text-neutral-500 hover:text-neutral-200 group-hover:block"
            >
              <Pencil size={12} />
            </button>
            <button
              onClick={() => setDeletingServer(server)}
              className="hidden rounded p-1 text-neutral-500 hover:text-red-400 group-hover:block"
            >
              <Trash2 size={12} />
            </button>
          </div>
          {server.status === 'error' && server.lastError && (
            <p className="px-2 pb-1 text-xs text-red-400">{server.lastError}</p>
          )}
        </div>
      ))}

      {modalMode === 'open' && (
        <AddServerModal
          initial={editingServer ?? undefined}
          onSave={handleSave}
          onClose={() => {
            setModalMode('closed')
            setEditingServer(null)
          }}
        />
      )}

      {deletingServer && (
        <ConfirmDialog
          title="Delete server"
          message={`Delete "${deletingServer.name}"? This cannot be undone.`}
          confirmLabel="Delete"
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeletingServer(null)}
        />
      )}
    </div>
  )
}
