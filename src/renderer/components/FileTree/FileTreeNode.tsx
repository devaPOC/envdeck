import { useRef, useState, type KeyboardEvent } from 'react'
import { File, Folder, FolderOpen } from 'lucide-react'
import { joinPath } from '../../utils/path'
import { FileEntryMenu } from './FileEntryMenu'
import { ConfirmDialog } from '../ConfirmDialog'
import type { SftpEntry } from './types'
import { sortEntries } from './sortEntries'

interface FileTreeNodeProps {
  serverId: string
  parentPath: string
  entry: SftpEntry
  depth: number
  onRenamed: (updated: SftpEntry) => void
  onDeleted: () => void
}

export function FileTreeNode({
  serverId,
  parentPath,
  entry,
  depth,
  onRenamed,
  onDeleted
}: FileTreeNodeProps): JSX.Element {
  const fullPath = joinPath(parentPath, entry.name)

  const [expanded, setExpanded] = useState(false)
  const [children, setChildren] = useState<SftpEntry[] | null>(null)
  const [loadingChildren, setLoadingChildren] = useState(false)
  const [childrenError, setChildrenError] = useState<string | null>(null)

  const [menuPos, setMenuPos] = useState<{ x: number; y: number } | null>(null)
  const [renaming, setRenaming] = useState(false)
  const [renameValue, setRenameValue] = useState(entry.name)
  const [pendingName, setPendingName] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  const renameSubmittedRef = useRef(false)

  function loadChildren(): void {
    setLoadingChildren(true)
    setChildrenError(null)
    window.electronAPI.sftp
      .listDir(serverId, fullPath)
      .then(setChildren)
      .catch((err) => {
        setChildrenError(
          err instanceof Error ? err.message : 'Could not read this directory'
        )
      })
      .finally(() => setLoadingChildren(false))
  }

  function handleToggle(): void {
    if (pendingName) return
    if (entry.type !== 'directory') return
    if (!expanded && children === null) loadChildren()
    setExpanded((value) => !value)
  }

  function handleChildRenamed(oldName: string, updated: SftpEntry): void {
    setChildren((prev) => prev?.map((e) => (e.name === oldName ? updated : e)).sort(sortEntries) ?? prev)
  }

  function handleChildDeleted(name: string): void {
    setChildren((prev) => prev?.filter((e) => e.name !== name) ?? prev)
  }

  async function handleRenameSubmit(): Promise<void> {
    // Enter fires onKeyDown and can also trigger the input's onBlur before this
    // resolves — guard against submitting the same rename twice (the second
    // call would target a source path the first rename already moved).
    if (renameSubmittedRef.current) return
    renameSubmittedRef.current = true

    const newName = renameValue.trim()
    if (!newName || newName === entry.name) {
      setRenaming(false)
      setRenameValue(entry.name)
      renameSubmittedRef.current = false
      return
    }

    // Show the new name immediately, disabled, instead of re-fetching the
    // whole directory — the row flips back to normal once the server confirms.
    setRenaming(false)
    setPendingName(newName)
    try {
      await window.electronAPI.sftp.rename(serverId, fullPath, joinPath(parentPath, newName))
      onRenamed({ ...entry, name: newName, isHidden: newName.startsWith('.') })
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Could not rename this item')
      setRenameValue(entry.name)
    } finally {
      setPendingName(null)
      renameSubmittedRef.current = false
    }
  }

  function handleRenameKeyDown(e: KeyboardEvent<HTMLInputElement>): void {
    if (e.key === 'Enter') void handleRenameSubmit()
    if (e.key === 'Escape') {
      setRenaming(false)
      setRenameValue(entry.name)
    }
  }

  async function handleConfirmDelete(): Promise<void> {
    setDeleting(false)
    try {
      await window.electronAPI.sftp.remove(serverId, fullPath, entry.type === 'directory')
      onDeleted()
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Could not delete this item')
    }
  }

  async function handleCopyPath(): Promise<void> {
    try {
      await navigator.clipboard.writeText(fullPath)
    } catch {
      setActionError('Could not copy path to clipboard')
    }
  }

  return (
    <div>
      <div
        onClick={handleToggle}
        onContextMenu={(e) => {
          if (pendingName) return
          e.preventDefault()
          setMenuPos({ x: e.clientX, y: e.clientY })
        }}
        style={{ paddingLeft: `${depth * 14 + 8}px` }}
        className={`flex items-center gap-1.5 py-1 pr-2 text-sm ${
          pendingName ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:bg-neutral-800'
        }`}
      >
        {entry.type === 'directory' ? (
          expanded ? (
            <FolderOpen size={14} className="shrink-0 text-blue-400" />
          ) : (
            <Folder size={14} className="shrink-0 text-blue-400" />
          )
        ) : (
          <File size={14} className="shrink-0 text-neutral-400" />
        )}

        {renaming ? (
          <input
            autoFocus
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onKeyDown={handleRenameKeyDown}
            onBlur={() => void handleRenameSubmit()}
            onClick={(e) => e.stopPropagation()}
            className="flex-1 rounded border border-neutral-700 bg-neutral-950 px-1 text-sm text-neutral-100"
          />
        ) : (
          <span
            className={`truncate ${
              pendingName || entry.isHidden ? 'text-neutral-500' : 'text-neutral-200'
            }`}
          >
            {pendingName ?? entry.name}
          </span>
        )}
      </div>

      {actionError && (
        <p
          style={{ paddingLeft: `${depth * 14 + 28}px` }}
          className="pb-1 text-xs text-red-400"
        >
          {actionError}
        </p>
      )}

      {expanded && entry.type === 'directory' && (
        <div>
          {loadingChildren && (
            <p
              style={{ paddingLeft: `${(depth + 1) * 14 + 8}px` }}
              className="py-1 text-xs text-neutral-500"
            >
              Loading…
            </p>
          )}
          {childrenError && (
            <p
              style={{ paddingLeft: `${(depth + 1) * 14 + 8}px` }}
              className="py-1 text-xs text-red-400"
            >
              {childrenError}
            </p>
          )}
          {children?.map((child) => (
            <FileTreeNode
              key={child.name}
              serverId={serverId}
              parentPath={fullPath}
              entry={child}
              depth={depth + 1}
              onRenamed={(updated) => handleChildRenamed(child.name, updated)}
              onDeleted={() => handleChildDeleted(child.name)}
            />
          ))}
        </div>
      )}

      {menuPos && (
        <FileEntryMenu
          x={menuPos.x}
          y={menuPos.y}
          onRename={() => setRenaming(true)}
          onDelete={() => setDeleting(true)}
          onCopyPath={() => void handleCopyPath()}
          onClose={() => setMenuPos(null)}
        />
      )}

      {deleting && (
        <ConfirmDialog
          title={`Delete ${entry.type === 'directory' ? 'folder' : 'file'}`}
          message={`Delete "${entry.name}"? This cannot be undone.`}
          confirmLabel="Delete"
          onConfirm={() => void handleConfirmDelete()}
          onCancel={() => setDeleting(false)}
        />
      )}
    </div>
  )
}
