import { useEditorStore } from '../../store/editorStore'
import { Editor } from './Editor'

export function EditorTabs(): JSX.Element {
  const openFiles = useEditorStore((state) => state.openFiles)
  const activeFileId = useEditorStore((state) => state.activeFileId)
  const setActiveFile = useEditorStore((state) => state.setActiveFile)
  const closeFile = useEditorStore((state) => state.closeFile)

  const activeFile = openFiles.find((f) => f.id === activeFileId)

  return (
    <div className="flex h-full flex-col">
      <div className="flex border-b border-neutral-800 bg-neutral-900">
        {openFiles.map((file) => (
          <div
            key={file.id}
            onClick={() => setActiveFile(file.id)}
            className={`flex cursor-pointer items-center gap-2 border-r border-neutral-800 px-3 py-1.5 text-sm ${
              activeFileId === file.id ? 'bg-neutral-800' : ''
            }`}
          >
            <span>
              {file.remotePath}
              {file.isDirty ? ' *' : ''}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation()
                closeFile(file.id)
              }}
              className="text-neutral-500 hover:text-neutral-200"
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
    </div>
  )
}
