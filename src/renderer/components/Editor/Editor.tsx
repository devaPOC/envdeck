import MonacoEditor from '@monaco-editor/react'
import type { OpenFile } from '../../store/editorStore'
import { useEditorStore } from '../../store/editorStore'

export function Editor({ file }: { file: OpenFile }): JSX.Element {
  const updateFileContent = useEditorStore((state) => state.updateFileContent)

  return (
    <MonacoEditor
      height="100%"
      theme="vs-dark"
      path={file.remotePath}
      value={file.content}
      onChange={(value) => updateFileContent(file.id, value ?? '')}
      options={{ minimap: { enabled: false }, fontSize: 13 }}
    />
  )
}
