import { ipcMain } from 'electron'
import { Client } from 'ssh2'

export interface SshConnectOptions {
  serverId: string
  host: string
  username: string
  pemKey: string
  port?: number
}

const connections = new Map<string, Client>()

export function registerSshHandlers(): void {
  ipcMain.handle('ssh:connect', async (_event, _options: SshConnectOptions) => {
    // TODO: open connection, store in `connections`, return status
    throw new Error('Not implemented')
  })

  ipcMain.handle('ssh:disconnect', async (_event, serverId: string) => {
    connections.get(serverId)?.end()
    connections.delete(serverId)
  })

  ipcMain.handle('ssh:exec', async (_event, _serverId: string, _command: string) => {
    // TODO: run command over existing connection, return stdout/stderr
    throw new Error('Not implemented')
  })
}

export function getConnection(serverId: string): Client | undefined {
  return connections.get(serverId)
}
