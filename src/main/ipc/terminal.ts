import { ipcMain, BrowserWindow } from 'electron'
import type { ClientChannel } from 'ssh2'
import { getConnection } from './ssh'

const sessions = new Map<string, ClientChannel>()

function broadcast(channel: string, payload: unknown): void {
  for (const win of BrowserWindow.getAllWindows()) {
    win.webContents.send(channel, payload)
  }
}

export function registerTerminalHandlers(): void {
  ipcMain.handle(
    'terminal:open',
    async (
      _event,
      terminalId: string,
      serverId: string,
      cols: number,
      rows: number
    ): Promise<void> => {
      const client = getConnection(serverId)
      if (!client) throw new Error('Not connected to this server')

      await new Promise<void>((resolve, reject) => {
        client.shell({ cols, rows, term: 'xterm-256color' }, (err, stream) => {
          if (err) {
            reject(err)
            return
          }

          sessions.set(terminalId, stream)

          stream.on('data', (data: Buffer) => {
            broadcast('terminal:data', { terminalId, data: data.toString('utf-8') })
          })
          stream.stderr.on('data', (data: Buffer) => {
            broadcast('terminal:data', { terminalId, data: data.toString('utf-8') })
          })
          stream.on('close', () => {
            sessions.delete(terminalId)
            broadcast('terminal:closed', { terminalId })
          })

          resolve()
        })
      })
    }
  )

  ipcMain.on('terminal:input', (_event, terminalId: string, data: string) => {
    sessions.get(terminalId)?.write(data)
  })

  ipcMain.on('terminal:resize', (_event, terminalId: string, cols: number, rows: number) => {
    sessions.get(terminalId)?.setWindow(rows, cols, 0, 0)
  })

  ipcMain.handle('terminal:close', async (_event, terminalId: string): Promise<void> => {
    sessions.get(terminalId)?.end()
    sessions.delete(terminalId)
  })
}

export function closeAllTerminals(): void {
  for (const [terminalId, stream] of sessions) {
    stream.end()
    sessions.delete(terminalId)
  }
}
