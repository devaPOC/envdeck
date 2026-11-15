import { contextBridge, ipcRenderer, type IpcRendererEvent } from 'electron'

export interface ServerRecord {
  id: string
  name: string
  host: string
  username: string
}

export interface ServerInput {
  name: string
  host: string
  username: string
  pemKey: string
}

export type SshStatus = 'connecting' | 'connected' | 'error' | 'disconnected'

export interface SshStatusPayload {
  serverId: string
  status: SshStatus
  message?: string
}

export interface SftpEntry {
  name: string
  type: 'file' | 'directory'
  size: number
  permissions: string
  isHidden: boolean
}

const electronAPI = {
  servers: {
    list: (): Promise<ServerRecord[]> => ipcRenderer.invoke('servers:list'),
    add: (input: ServerInput): Promise<ServerRecord> => ipcRenderer.invoke('servers:add', input),
    update: (id: string, input: Partial<ServerInput>): Promise<ServerRecord> =>
      ipcRenderer.invoke('servers:update', id, input),
    remove: (id: string): Promise<void> => ipcRenderer.invoke('servers:remove', id)
  },
  ssh: {
    connect: (serverId: string): Promise<void> => ipcRenderer.invoke('ssh:connect', serverId),
    disconnect: (serverId: string): Promise<void> =>
      ipcRenderer.invoke('ssh:disconnect', serverId),
    exec: (serverId: string, command: string) => ipcRenderer.invoke('ssh:exec', serverId, command),
    onStatusChange: (callback: (payload: SshStatusPayload) => void): (() => void) => {
      const handler = (_event: IpcRendererEvent, payload: SshStatusPayload): void => callback(payload)
      ipcRenderer.on('ssh:status', handler)
      return () => ipcRenderer.removeListener('ssh:status', handler)
    }
  },
  sftp: {
    home: (serverId: string): Promise<string> => ipcRenderer.invoke('sftp:home', serverId),
    listDir: (serverId: string, remotePath: string): Promise<SftpEntry[]> =>
      ipcRenderer.invoke('sftp:listDir', serverId, remotePath),
    readFile: (serverId: string, remotePath: string): Promise<string> =>
      ipcRenderer.invoke('sftp:readFile', serverId, remotePath),
    writeFile: (serverId: string, remotePath: string, content: string): Promise<void> =>
      ipcRenderer.invoke('sftp:writeFile', serverId, remotePath, content),
    rename: (serverId: string, oldPath: string, newPath: string): Promise<void> =>
      ipcRenderer.invoke('sftp:rename', serverId, oldPath, newPath),
    remove: (serverId: string, remotePath: string, isDirectory: boolean): Promise<void> =>
      ipcRenderer.invoke('sftp:remove', serverId, remotePath, isDirectory)
  },
  docker: {
    listContainers: (serverId: string) => ipcRenderer.invoke('docker:listContainers', serverId),
    start: (serverId: string, containerId: string) =>
      ipcRenderer.invoke('docker:start', serverId, containerId),
    stop: (serverId: string, containerId: string) =>
      ipcRenderer.invoke('docker:stop', serverId, containerId),
    restart: (serverId: string, containerId: string) =>
      ipcRenderer.invoke('docker:restart', serverId, containerId)
  }
}

contextBridge.exposeInMainWorld('electronAPI', electronAPI)

export type ElectronAPI = typeof electronAPI
