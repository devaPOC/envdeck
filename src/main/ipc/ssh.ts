import { ipcMain, BrowserWindow } from 'electron'
import { Client } from 'ssh2'
import { getPemKey } from '../keychain'
import { getServerRecord } from './servers'

export type SshStatus = 'connecting' | 'connected' | 'error' | 'disconnected'

export interface SshStatusPayload {
  serverId: string
  status: SshStatus
  message?: string
}

const connections = new Map<string, Client>()

function broadcastStatus(serverId: string, status: SshStatus, message?: string): void {
  const payload: SshStatusPayload = { serverId, status, message }
  for (const win of BrowserWindow.getAllWindows()) {
    win.webContents.send('ssh:status', payload)
  }
}

function humanizeSshError(err: NodeJS.ErrnoException): string {
  switch (err.code) {
    case 'ENOTFOUND':
    case 'EHOSTUNREACH':
      return 'Could not connect — check your IP and PEM key'
    case 'ECONNREFUSED':
      return 'Could not connect — check your IP and that SSH is running on the server'
    case 'ETIMEDOUT':
      return 'Connection timed out — check your IP and network'
  }
  if (/authentication/i.test(err.message)) {
    return 'Authentication failed — check your username and PEM key'
  }
  if (/timed out/i.test(err.message)) {
    return 'Connection timed out — check your IP and network'
  }
  return err.message || 'Could not connect to the server'
}

export function registerSshHandlers(): void {
  ipcMain.handle('ssh:connect', async (_event, serverId: string): Promise<void> => {
    if (connections.has(serverId)) return

    try {
      const server = getServerRecord(serverId)
      if (!server) {
        broadcastStatus(serverId, 'error', 'Server not found')
        return
      }

      const pemKey = await getPemKey(serverId)
      if (!pemKey) {
        broadcastStatus(serverId, 'error', 'No PEM key saved for this server')
        return
      }

      broadcastStatus(serverId, 'connecting')

      await new Promise<void>((resolve) => {
        const client = new Client()
        let erroredOut = false

        client.on('ready', () => {
          connections.set(serverId, client)
          broadcastStatus(serverId, 'connected')
          resolve()
        })

        client.on('error', (err: NodeJS.ErrnoException) => {
          erroredOut = true
          connections.delete(serverId)
          broadcastStatus(serverId, 'error', humanizeSshError(err))
          resolve()
        })

        client.on('close', () => {
          connections.delete(serverId)
          // ssh2 always emits 'close' right after 'error' — skip it here so it
          // doesn't immediately clobber the error status back to disconnected.
          if (!erroredOut) broadcastStatus(serverId, 'disconnected')
        })

        client.connect({
          host: server.host,
          username: server.username,
          privateKey: pemKey,
          readyTimeout: 15000
        })
      })
    } catch (err) {
      broadcastStatus(
        serverId,
        'error',
        err instanceof Error ? err.message : 'Could not connect to the server'
      )
    }
  })

  ipcMain.handle('ssh:disconnect', async (_event, serverId: string): Promise<void> => {
    connections.get(serverId)?.end()
    connections.delete(serverId)
    broadcastStatus(serverId, 'disconnected')
  })

  ipcMain.handle('ssh:exec', async (_event, _serverId: string, _command: string) => {
    // TODO: run command over existing connection, return stdout/stderr
    throw new Error('Not implemented')
  })
}

export function getConnection(serverId: string): Client | undefined {
  return connections.get(serverId)
}

export function disconnectAllSsh(): void {
  for (const [serverId, client] of connections) {
    client.end()
    connections.delete(serverId)
  }
}
