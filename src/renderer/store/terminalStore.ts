import { create } from 'zustand'

export interface TerminalSession {
  id: string
  serverId: string
  title: string
}

interface TerminalState {
  sessions: TerminalSession[]
  activeTerminalId: string | null
  addSession: (session: TerminalSession) => void
  removeSession: (id: string) => void
  setActiveTerminal: (id: string | null) => void
}

export const useTerminalStore = create<TerminalState>((set) => ({
  sessions: [],
  activeTerminalId: null,
  addSession: (session) =>
    set((state) => ({ sessions: [...state.sessions, session], activeTerminalId: session.id })),
  removeSession: (id) =>
    set((state) => ({
      sessions: state.sessions.filter((s) => s.id !== id),
      activeTerminalId: state.activeTerminalId === id ? null : state.activeTerminalId
    })),
  setActiveTerminal: (id) => set({ activeTerminalId: id })
}))
