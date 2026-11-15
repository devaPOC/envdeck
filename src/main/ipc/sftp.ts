import { ipcMain } from 'electron'
import { getConnection } from './ssh'

export function registerSftpHandlers(): void {
  ipcMain.handle('sftp:listDir', async (_event, serverId: string, _remotePath: string) => {
    const conn = getConnection(serverId)
    if (!conn) throw new Error('No active SSH connection for this server')
    // TODO: open SFTP from existing connection, list directory contents
    throw new Error('Not implemented')
  })

  ipcMain.handle('sftp:readFile', async (_event, _serverId: string, _remotePath: string) => {
    // TODO: read remote file contents
    throw new Error('Not implemented')
  })

  ipcMain.handle(
    'sftp:writeFile',
    async (_event, _serverId: string, _remotePath: string, _content: string) => {
      // TODO: write remote file contents
      throw new Error('Not implemented')
    }
  )
}
