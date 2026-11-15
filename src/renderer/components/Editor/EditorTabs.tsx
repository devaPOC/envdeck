import { useEffect, useRef, useState } from 'react'
import { useEditorStore } from '../../store/editorStore'
import type { OpenFile } from '../../store/editorStore'
import { Editor } from './Editor'
import { ConfirmDialog } from '../ConfirmDialog'

export function EditorTabs(): JSX.Element {
  const openFiles = useEditorStore((state) => state.openFiles)
  const activeFileId = useEditorStore((state) => state.activeFileId)
  const setActiveFile = useEditorStore((state) => state.setActiveFile)
  const closeFile = useEditorStore((state) => state.closeFile)
  const markSaved = useEditorStore((state) => state.markSaved)
  const setSaveError = useEditorStore((state) => state.setSaveError)

  const [closingFile, setClosingFile] = useState<OpenFile | null>(null)

  const activeFile = openFiles.find((f) => f.id === activeFileId)
  const activeFileRef = useRef(activeFile)
  activeFileRef.current = activeFile

  async function handleSave(file: OpenFile): Promise<void> {
    if (!file.isDirty) return
    try {
      await window.electronAPI.sftp.writeFile(file.serverId, file.remotePath, file.content)
      markSaved(file.id)
    } catch (err) {
      setSaveError(file.id, err instanceof Error ? err.message : 'Could not save this file')
    }
  }

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent): void {
      const isSaveShortcut = (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's'
      if (!isSaveShortcut) return
      e.preventDefault()
      if (activeFileRef.current) void handleSave(activeFileRef.current)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  function handleCloseRequest(file: OpenFile): void {
    if (file.isDirty) {
      setClosingFile(file)
    } else {
      closeFile(file.id)
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex border-b border-neutral-800 bg-neutral-900">
        {openFiles.map((file) => (
          <div
            key={file.id}
            onClick={() => setActiveFile(file.id)}
            title={file.remotePath}
            className={`flex max-w-[200px] cursor-pointer items-center gap-2 border-r border-neutral-800 px-3 py-1.5 text-sm ${
              activeFileId === file.id ? 'bg-neutral-800' : ''
            }`}
          >
            <span className="flex min-w-0 items-center gap-1.5">
              <span className="truncate">{file.remotePath.split('/').pop()}</span>
              {file.isDirty && (
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-neutral-400" />
              )}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleCloseRequest(file)
              }}
              className="shrink-0 text-neutral-500 hover:text-neutral-200"
            >
              ×
            </button>
          </div>
        ))}
      </div>
      <div className="flex-1">
        {activeFile ? (
          <Editor file={activeFile} />
        ) : (
          <div className="flex h-full items-center justify-center text-neutral-500">
            No file open
          </div>
        )}
      </div>

      {closingFile && (
        <ConfirmDialog
          title="Unsaved changes"
          message={`"${closingFile.remotePath.split('/').pop()}" has unsaved changes. Close without saving?`}
          confirmLabel="Close Without Saving"
          onConfirm={() => {
            closeFile(closingFile.id)
            setClosingFile(null)
          }}
          onCancel={() => setClosingFile(null)}
        />
      )}
    </div>
  )
}
