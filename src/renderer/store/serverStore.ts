import { create } from 'zustand'

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error'

export interface Server {
  id: string
  name: string
  host: string
  username: string
  status: ConnectionStatus
  lastError?: string
}

interface ServerState {
  servers: Server[]
  activeServerId: string | null
  setServers: (servers: Server[]) => void
  addServer: (server: Server) => void
  updateServer: (serverId: string, updates: Partial<Omit<Server, 'id'>>) => void
  removeServer: (serverId: string) => void
  setStatus: (serverId: string, status: ConnectionStatus, message?: string) => void
  setActiveServer: (serverId: string | null) => void
}

export const useServerStore = create<ServerState>((set) => ({
  servers: [],
  activeServerId: null,
  setServers: (servers) => set({ servers }),
  addServer: (server) => set((state) => ({ servers: [...state.servers, server] })),
  updateServer: (serverId, updates) =>
    set((state) => ({
      servers: state.servers.map((s) => (s.id === serverId ? { ...s, ...updates } : s))
    })),
  removeServer: (serverId) =>
    set((state) => ({
      servers: state.servers.filter((s) => s.id !== serverId),
      activeServerId: state.activeServerId === serverId ? null : state.activeServerId
    })),
  setStatus: (serverId, status, message) =>
    set((state) => ({
      servers: state.servers.map((s) =>
        s.id === serverId ? { ...s, status, lastError: status === 'error' ? message : undefined } : s
      )
    })),
  setActiveServer: (serverId) => set({ activeServerId: serverId })
}))
