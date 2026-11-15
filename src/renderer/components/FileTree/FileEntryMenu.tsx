import { ClipboardCopy, Pencil, Trash2 } from 'lucide-react'

interface FileEntryMenuProps {
  x: number
  y: number
  onRename: () => void
  onDelete: () => void
  onCopyPath: () => void
  onClose: () => void
}

export function FileEntryMenu({
  x,
  y,
  onRename,
  onDelete,
  onCopyPath,
  onClose
}: FileEntryMenuProps): JSX.Element {
  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} onContextMenu={onClose} />
      <div
        style={{ left: x, top: y }}
        className="fixed z-50 w-44 rounded-md border border-neutral-800 bg-neutral-900 py-1 shadow-lg"
      >
        <button
          onClick={() => {
            onRename()
            onClose()
          }}
          className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm text-neutral-200 hover:bg-neutral-800"
        >
          <Pencil size={14} />
          Rename
        </button>
        <button
          onClick={() => {
            onCopyPath()
            onClose()
          }}
          className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm text-neutral-200 hover:bg-neutral-800"
        >
          <ClipboardCopy size={14} />
          Copy Path
        </button>

        <div className="my-1 border-t border-neutral-800" />

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
