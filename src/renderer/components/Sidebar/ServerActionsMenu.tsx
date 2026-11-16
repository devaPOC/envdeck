import { Pencil, Plug, Trash2, Unplug } from 'lucide-react'
import type { Server } from '../../store/serverStore'
import { AnimatedDots } from '../AnimatedDots'

interface ServerActionsMenuProps {
  server: Server
  onConnect: () => void
  onDisconnect: () => void
  onEdit: () => void
  onDelete: () => void
  onClose: () => void
}

export function ServerActionsMenu({
  server,
  onConnect,
  onDisconnect,
  onEdit,
  onDelete,
  onClose
}: ServerActionsMenuProps): JSX.Element {
  const isConnecting = server.status === 'connecting'
  const isConnected = server.status === 'connected'

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="absolute right-0 top-full z-50 mt-1 w-40 rounded-md border border-neutral-800 bg-neutral-900 py-1 shadow-lg">
        <button
          onClick={() => {
            if (isConnected) {
              onDisconnect()
            } else {
              onConnect()
            }
            onClose()
          }}
          disabled={isConnecting}
          className={`flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm ${
            isConnecting
              ? 'cursor-not-allowed text-neutral-500'
              : 'text-neutral-200 hover:bg-neutral-800'
          }`}
        >
          {isConnecting ? (
            <Plug size={14} />
          ) : isConnected ? (
            <Unplug size={14} />
          ) : (
            <Plug size={14} />
          )}
          {isConnecting ? (
            <span className="flex items-center gap-1">
              Connecting
              <AnimatedDots />
            </span>
          ) : isConnected ? (
            'Disconnect'
          ) : (
            'Connect'
          )}
        </button>

        <div className="my-1 border-t border-neutral-800" />

        <button
          onClick={() => {
            onEdit()
            onClose()
          }}
          className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm text-neutral-200 hover:bg-neutral-800"
        >
          <Pencil size={14} />
          Edit
        </button>
        <button
          onClick={() => {
            onDelete()
            onClose()
          }}
          className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm text-red-400 hover:bg-neutral-800"
        >
          <Trash2 size={14} />
          Delete
        </button>
      </div>
    </>
  )
}
