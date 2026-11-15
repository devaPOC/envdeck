import { create } from 'zustand'

export interface OpenFile {
  id: string
  serverId: string
  remotePath: string
  content: string
  isDirty: boolean
}

interface EditorState {
  openFiles: OpenFile[]
  activeFileId: string | null
  openFile: (file: OpenFile) => void
  closeFile: (fileId: string) => void
  updateFileContent: (fileId: string, content: string) => void
  setActiveFile: (fileId: string | null) => void
}

export const useEditorStore = create<EditorState>((set) => ({
  openFiles: [],
  activeFileId: null,
  openFile: (file) =>
    set((state) => ({
      openFiles: state.openFiles.some((f) => f.id === file.id)
        ? state.openFiles
        : [...state.openFiles, file],
      activeFileId: file.id
    })),
  closeFile: (fileId) =>
    set((state) => ({
      openFiles: state.openFiles.filter((f) => f.id !== fileId),
      activeFileId: state.activeFileId === fileId ? null : state.activeFileId
    })),
  updateFileContent: (fileId, content) =>
    set((state) => ({
      openFiles: state.openFiles.map((f) =>
        f.id === fileId ? { ...f, content, isDirty: true } : f
      )
    })),
  setActiveFile: (fileId) => set({ activeFileId: fileId })
}))
