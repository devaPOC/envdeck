import MonacoEditor from '@monaco-editor/react'
import type { OpenFile } from '../../store/editorStore'
import { useEditorStore } from '../../store/editorStore'
import { detectLanguage } from './detectLanguage'

export function Editor({ file }: { file: OpenFile }): JSX.Element {
  const updateFileContent = useEditorStore((state) => state.updateFileContent)

  return (
    <div className="flex h-full flex-col">
      {file.saveError && (
        <div className="bg-red-950/50 px-3 py-1.5 text-xs text-red-300">{file.saveError}</div>
      )}
      <div className="flex-1">
        <MonacoEditor
          height="100%"
          theme="vs-dark"
          path={file.remotePath}
          language={detectLanguage(file.remotePath)}
          value={file.content}
          onChange={(value) => updateFileContent(file.id, value ?? '')}
          options={{ minimap: { enabled: false }, fontSize: 13 }}
        />
      </div>
    </div>
  )
}
