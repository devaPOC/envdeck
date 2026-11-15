import { ipcMain } from 'electron'
import { getConnection } from './ssh'

export function registerDockerHandlers(): void {
  ipcMain.handle('docker:listContainers', async (_event, serverId: string) => {
    const conn = getConnection(serverId)
    if (!conn) throw new Error('No active SSH connection for this server')
    // TODO: run `docker ps` over the connection, parse output
    throw new Error('Not implemented')
  })

  ipcMain.handle('docker:start', async (_event, _serverId: string, _containerId: string) => {
    // TODO: run `docker start <containerId>`
    throw new Error('Not implemented')
  })

  ipcMain.handle('docker:stop', async (_event, _serverId: string, _containerId: string) => {
    // TODO: run `docker stop <containerId>`
    throw new Error('Not implemented')
  })

  ipcMain.handle('docker:restart', async (_event, _serverId: string, _containerId: string) => {
    // TODO: run `docker restart <containerId>`
    throw new Error('Not implemented')
  })
}
