import { contextBridge, ipcRenderer } from 'electron'

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

const electronAPI = {
  servers: {
    list: (): Promise<ServerRecord[]> => ipcRenderer.invoke('servers:list'),
    add: (input: ServerInput): Promise<ServerRecord> => ipcRenderer.invoke('servers:add', input),
    update: (id: string, input: Partial<ServerInput>): Promise<ServerRecord> =>
      ipcRenderer.invoke('servers:update', id, input),
    remove: (id: string): Promise<void> => ipcRenderer.invoke('servers:remove', id)
  },
  ssh: {
    connect: (options: {
      serverId: string
      host: string
      username: string
      pemKey: string
      port?: number
    }) => ipcRenderer.invoke('ssh:connect', options),
    disconnect: (serverId: string) => ipcRenderer.invoke('ssh:disconnect', serverId),
    exec: (serverId: string, command: string) => ipcRenderer.invoke('ssh:exec', serverId, command)
  },
  sftp: {
    listDir: (serverId: string, remotePath: string) =>
      ipcRenderer.invoke('sftp:listDir', serverId, remotePath),
    readFile: (serverId: string, remotePath: string) =>
      ipcRenderer.invoke('sftp:readFile', serverId, remotePath),
    writeFile: (serverId: string, remotePath: string, content: string) =>
      ipcRenderer.invoke('sftp:writeFile', serverId, remotePath, content)
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
