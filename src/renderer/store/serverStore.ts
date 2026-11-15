import { create } from 'zustand'

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error'

export interface Server {
  id: string
  name: string
  host: string
  username: string
  status: ConnectionStatus
}

interface ServerState {
  servers: Server[]
  activeServerId: string | null
  addServer: (server: Server) => void
  removeServer: (serverId: string) => void
  setStatus: (serverId: string, status: ConnectionStatus) => void
  setActiveServer: (serverId: string | null) => void
}

export const useServerStore = create<ServerState>((set) => ({
  servers: [],
  activeServerId: null,
  addServer: (server) => set((state) => ({ servers: [...state.servers, server] })),
  removeServer: (serverId) =>
    set((state) => ({ servers: state.servers.filter((s) => s.id !== serverId) })),
  setStatus: (serverId, status) =>
    set((state) => ({
      servers: state.servers.map((s) => (s.id === serverId ? { ...s, status } : s))
    })),
  setActiveServer: (serverId) => set({ activeServerId: serverId })
}))
