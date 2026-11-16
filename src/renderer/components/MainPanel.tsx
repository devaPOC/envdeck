import { useEffect, useRef, useState } from 'react'
import { TerminalSquare } from 'lucide-react'
import { useEditorStore } from '../store/editorStore'
import type { OpenFile } from '../store/editorStore'
import { useTerminalStore } from '../store/terminalStore'
import { useServerStore } from '../store/serverStore'
import { Editor } from './Editor/Editor'
import { Terminal } from './Terminal/Terminal'
import { ConfirmDialog } from './ConfirmDialog'

type PanelMode = 'file' | 'terminal'

export function MainPanel(): JSX.Element {
  const openFiles = useEditorStore((state) => state.openFiles)
  const activeFileId = useEditorStore((state) => state.activeFileId)
  const setActiveFile = useEditorStore((state) => state.setActiveFile)
  const closeFile = useEditorStore((state) => state.closeFile)
  const markSaved = useEditorStore((state) => state.markSaved)
  const setSaveError = useEditorStore((state) => state.setSaveError)

  const terminals = useTerminalStore((state) => state.sessions)
  const activeTerminalId = useTerminalStore((state) => state.activeTerminalId)
  const setActiveTerminal = useTerminalStore((state) => state.setActiveTerminal)
  const addTerminalSession = useTerminalStore((state) => state.addSession)
  const removeTerminalSession = useTerminalStore((state) => state.removeSession)

  const activeServer = useServerStore((state) =>
    state.servers.find((s) => s.id === state.activeServerId)
  )

  const [mode, setMode] = useState<PanelMode>('file')
  const [closingFile, setClosingFile] = useState<OpenFile | null>(null)

  const activeFile = openFiles.find((f) => f.id === activeFileId)
  const activeFileRef = useRef(activeFile)
  activeFileRef.current = activeFile
  const modeRef = useRef(mode)
  modeRef.current = mode
  const activeTerminalIdRef = useRef(activeTerminalId)
  activeTerminalIdRef.current = activeTerminalId
  const activeServerRef = useRef(activeServer)
  activeServerRef.current = activeServer

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
      if (!e.metaKey && !e.ctrlKey) return
      const key = e.key.toLowerCase()

      if (key === 's') {
        if (modeRef.current !== 'file' || !activeFileRef.current) return
        e.preventDefault()
        void handleSave(activeFileRef.current)
        return
      }

      if (key === 'w') {
        if (modeRef.current === 'file' && activeFileRef.current) {
          e.preventDefault()
          const file = activeFileRef.current
          if (file.isDirty) setClosingFile(file)
          else closeFile(file.id)
        } else if (modeRef.current === 'terminal' && activeTerminalIdRef.current) {
          e.preventDefault()
          removeTerminalSession(activeTerminalIdRef.current)
        }
        return
      }

      if (key === 't') {
        const server = activeServerRef.current
        if (!server || server.status !== 'connected') return
        e.preventDefault()
        addTerminalSession({ id: crypto.randomUUID(), serverId: server.id, title: server.name })
        setMode('terminal')
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [closeFile, removeTerminalSession, addTerminalSession])

  function handleCloseFileRequest(file: OpenFile): void {
    if (file.isDirty) {
      setClosingFile(file)
    } else {
      closeFile(file.id)
    }
  }

  function handleCloseTerminal(id: string): void {
    removeTerminalSession(id)
  }

  function handleNewTerminal(): void {
    if (!activeServer || activeServer.status !== 'connected') return
    const id = crypto.randomUUID()
    addTerminalSession({ id, serverId: activeServer.id, title: activeServer.name })
    setMode('terminal')
  }

  const canOpenTerminal = Boolean(activeServer && activeServer.status === 'connected')

  return (
    <div className="flex h-full flex-col">
      <div className="flex border-b border-neutral-800 bg-neutral-900">
        {openFiles.map((file) => (
          <div
            key={file.id}
            onClick={() => {
              setMode('file')
              setActiveFile(file.id)
            }}
            title={file.remotePath}
            className={`flex max-w-[200px] cursor-pointer items-center gap-2 border-r border-neutral-800 px-3 py-1.5 text-sm ${
              mode === 'file' && activeFileId === file.id ? 'bg-neutral-800' : ''
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
                handleCloseFileRequest(file)
              }}
              className="shrink-0 text-neutral-500 hover:text-neutral-200"
            >
              ×
            </button>
          </div>
        ))}

        {terminals.map((term) => (
          <div
            key={term.id}
            onClick={() => {
              setMode('terminal')
              setActiveTerminal(term.id)
            }}
            className={`flex max-w-[160px] cursor-pointer items-center gap-2 border-r border-neutral-800 px-3 py-1.5 text-sm ${
              mode === 'terminal' && activeTerminalId === term.id ? 'bg-neutral-800' : ''
            }`}
          >
            <TerminalSquare size={13} className="shrink-0 text-neutral-400" />
            <span className="truncate">{term.title}</span>
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleCloseTerminal(term.id)
              }}
              className="shrink-0 text-neutral-500 hover:text-neutral-200"
            >
              ×
            </button>
          </div>
        ))}

        <button
          onClick={handleNewTerminal}
          disabled={!canOpenTerminal}
          title={canOpenTerminal ? 'New terminal' : 'Connect to a server to open a terminal'}
          className="flex items-center gap-1 px-3 py-1.5 text-sm text-neutral-500 enabled:hover:bg-neutral-800 enabled:hover:text-neutral-200 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <TerminalSquare size={13} />+
        </button>
      </div>

      <div className="relative flex-1">
        {mode === 'file' &&
          (activeFile ? (
            <Editor file={activeFile} />
          ) : (
            <div className="flex h-full items-center justify-center text-neutral-500">
              No file open
            </div>
          ))}

        {terminals.map((term) => (
          <div
            key={term.id}
            className="absolute inset-0"
            style={{
              display: mode === 'terminal' && activeTerminalId === term.id ? 'block' : 'none'
            }}
          >
            <Terminal session={term} />
          </div>
        ))}

        {mode === 'terminal' && terminals.length === 0 && (
          <div className="flex h-full items-center justify-center text-neutral-500">
            No terminal open
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
