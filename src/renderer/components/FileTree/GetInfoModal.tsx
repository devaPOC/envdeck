import { File, Folder } from 'lucide-react'
import type { SftpEntry } from './types'
import { formatBytes } from './formatBytes'

interface GetInfoModalProps {
  entry: SftpEntry
  path: string
  onClose: () => void
}

function InfoRow({ label, value }: { label: string; value: string }): JSX.Element {
  return (
    <div className="flex items-start justify-between gap-4 py-1.5 text-sm">
      <span className="text-neutral-500">{label}</span>
      <span className="max-w-[200px] truncate text-right font-mono text-neutral-200" title={value}>
        {value}
      </span>
    </div>
  )
}

export function GetInfoModal({ entry, path, onClose }: GetInfoModalProps): JSX.Element {
  const isDirectory = entry.type === 'directory'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-80 rounded-lg border border-neutral-800 bg-neutral-900 p-4">
        <div className="flex items-center justify-between pb-2">
          <h2 className="text-sm font-semibold text-neutral-100">Get Info</h2>
          <button onClick={onClose} className="text-neutral-500 hover:text-neutral-200">
            ×
          </button>
        </div>

        <div className="flex flex-col items-center gap-2 py-3">
          {isDirectory ? (
            <Folder size={40} className="text-blue-400" />
          ) : (
            <File size={40} className="text-neutral-400" />
          )}
          <span className="truncate text-sm font-medium text-neutral-100">{entry.name}</span>
        </div>

        <div className="divide-y divide-neutral-800 border-t border-neutral-800">
          <InfoRow label="Kind" value={isDirectory ? 'Folder' : 'File'} />
          <InfoRow label="Size" value={isDirectory ? '--' : formatBytes(entry.size)} />
          <InfoRow label="Permissions" value={entry.permissions} />
          <InfoRow label="Modified" value={new Date(entry.modifiedAt).toLocaleString()} />
          <InfoRow label="Path" value={path} />
        </div>
      </div>
    </div>
  )
}
