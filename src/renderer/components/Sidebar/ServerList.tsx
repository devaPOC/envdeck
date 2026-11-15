import { useEffect, useState } from 'react'
import { MoreVertical, Plus } from 'lucide-react'
import { useServerStore } from '../../store/serverStore'
import type { Server } from '../../store/serverStore'
import { StatusDot } from './StatusDot'
import { AddServerModal } from './AddServerModal'
import type { ServerFormValues } from './AddServerModal'
import { ServerActionsMenu } from './ServerActionsMenu'
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
  const [openMenuServerId, setOpenMenuServerId] = useState<string | null>(null)

  useEffect(() => {
    window.electronAPI.servers.list().then((records) => {
      setServers(records.map((record) => ({ ...record, status: 'disconnected' as const })))
    })
  }, [setServers])

  async function attemptConnect(serverId: string): Promise<void> {
    setStatus(serverId, 'connecting')
    try {
      await window.electronAPI.ssh.connect(serverId)
    } catch {
      // The main process already broadcast a human-readable error via ssh:status.
    }
  }

  async function handleSave(values: ServerFormValues): Promise<void> {
    if (editingServer) {
      // Host/username/key may have changed — tear down any live connection so it
      // doesn't keep pointing at the old target.
      await window.electronAPI.ssh.disconnect(editingServer.id)
      const updated = await window.electronAPI.servers.update(editingServer.id, values)
      updateServer(editingServer.id, updated)

      // Always retry against the new details so the dot reflects reality
      // right away, whether or not the server happened to be connected
      // before the edit. Not awaited — the save flow (and the modal)
      // shouldn't block on a connection attempt that can take up to the
      // 15s readyTimeout to fail.
      void attemptConnect(editingServer.id)
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
    await attemptConnect(server.id)
  }

  async function handleDisconnect(server: Server): Promise<void> {
    await window.electronAPI.ssh.disconnect(server.id)
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
        <div key={server.id} className="relative">
          <div
            className={`flex items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-neutral-800 ${
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
              onClick={() => setOpenMenuServerId(server.id)}
              className="rounded p-1 text-neutral-500 hover:bg-neutral-700 hover:text-neutral-200"
            >
              <MoreVertical size={14} />
            </button>
          </div>
          {server.status === 'error' && server.lastError && (
            <p className="px-2 pb-1 text-xs text-red-400">{server.lastError}</p>
          )}
          {openMenuServerId === server.id && (
            <ServerActionsMenu
              server={server}
              onConnect={() => handleConnect(server)}
              onDisconnect={() => handleDisconnect(server)}
              onEdit={() => {
                setEditingServer(server)
                setModalMode('open')
              }}
              onDelete={() => setDeletingServer(server)}
              onClose={() => setOpenMenuServerId(null)}
            />
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
