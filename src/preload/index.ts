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

export interface TerminalDataPayload {
  terminalId: string
  data: string
}

export interface TerminalClosedPayload {
  terminalId: string
}

export type DockerAction = 'start' | 'stop' | 'restart'

export interface DockerContainer {
  id: string
  name: string
  image: string
  status: string
  ports: string
  running: boolean
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
  terminal: {
    open: (terminalId: string, serverId: string, cols: number, rows: number): Promise<void> =>
      ipcRenderer.invoke('terminal:open', terminalId, serverId, cols, rows),
    input: (terminalId: string, data: string): void =>
      ipcRenderer.send('terminal:input', terminalId, data),
    resize: (terminalId: string, cols: number, rows: number): void =>
      ipcRenderer.send('terminal:resize', terminalId, cols, rows),
    close: (terminalId: string): Promise<void> => ipcRenderer.invoke('terminal:close', terminalId),
    onData: (callback: (payload: TerminalDataPayload) => void): (() => void) => {
      const handler = (_event: IpcRendererEvent, payload: TerminalDataPayload): void =>
        callback(payload)
      ipcRenderer.on('terminal:data', handler)
      return () => ipcRenderer.removeListener('terminal:data', handler)
    },
    onClosed: (callback: (payload: TerminalClosedPayload) => void): (() => void) => {
      const handler = (_event: IpcRendererEvent, payload: TerminalClosedPayload): void =>
        callback(payload)
      ipcRenderer.on('terminal:closed', handler)
      return () => ipcRenderer.removeListener('terminal:closed', handler)
    }
  },
  docker: {
    list: (serverId: string): Promise<DockerContainer[]> => ipcRenderer.invoke('docker:list', serverId),
    action: (serverId: string, containerId: string, action: DockerAction): Promise<void> =>
      ipcRenderer.invoke('docker:action', serverId, containerId, action),
    logs: (serverId: string, containerId: string): Promise<string> =>
      ipcRenderer.invoke('docker:logs', serverId, containerId)
  }
}

contextBridge.exposeInMainWorld('electronAPI', electronAPI)

export type ElectronAPI = typeof electronAPI
