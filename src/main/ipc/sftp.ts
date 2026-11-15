import { ipcMain } from 'electron'
import type { SFTPWrapper, FileEntryWithStats } from 'ssh2'
import { getConnection } from './ssh'

export interface SftpEntry {
  name: string
  type: 'file' | 'directory'
  size: number
  permissions: string
  isHidden: boolean
}

function openSftp(serverId: string): Promise<SFTPWrapper> {
  const client = getConnection(serverId)
  if (!client) return Promise.reject(new Error('Not connected to this server'))
  return new Promise((resolve, reject) => {
    client.sftp((err, sftp) => {
      if (err) reject(err)
      else resolve(sftp)
    })
  })
}

function formatPermissions(mode: number): string {
  const bits = ['---', '--x', '-w-', '-wx', 'r--', 'r-x', 'rw-', 'rwx']
  const perm = mode & 0o777
  return `${bits[(perm >> 6) & 7]}${bits[(perm >> 3) & 7]}${bits[perm & 7]}`
}

function toSftpEntry(entry: FileEntryWithStats): SftpEntry {
  return {
    name: entry.filename,
    type: entry.attrs.isDirectory() ? 'directory' : 'file',
    size: entry.attrs.size,
    permissions: formatPermissions(entry.attrs.mode),
    isHidden: entry.filename.startsWith('.')
  }
}

export function registerSftpHandlers(): void {
  ipcMain.handle('sftp:home', async (_event, serverId: string): Promise<string> => {
    const sftp = await openSftp(serverId)
    return new Promise((resolve, reject) => {
      sftp.realpath('.', (err, absPath) => (err ? reject(err) : resolve(absPath)))
    })
  })

  ipcMain.handle(
    'sftp:listDir',
    async (_event, serverId: string, remotePath: string): Promise<SftpEntry[]> => {
      const sftp = await openSftp(serverId)
      const list = await new Promise<FileEntryWithStats[]>((resolve, reject) => {
        sftp.readdir(remotePath, (err, list) => (err ? reject(err) : resolve(list)))
      })
      return list
        .map(toSftpEntry)
        .sort((a, b) =>
          a.type === b.type ? a.name.localeCompare(b.name) : a.type === 'directory' ? -1 : 1
        )
    }
  )

  ipcMain.handle(
    'sftp:readFile',
    async (_event, serverId: string, remotePath: string): Promise<string> => {
      const sftp = await openSftp(serverId)
      return new Promise((resolve, reject) => {
        const chunks: Buffer[] = []
        const stream = sftp.createReadStream(remotePath)
        stream.on('data', (chunk) => chunks.push(chunk as Buffer))
        stream.on('error', reject)
        stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')))
      })
    }
  )

  ipcMain.handle(
    'sftp:writeFile',
    async (_event, serverId: string, remotePath: string, content: string): Promise<void> => {
      const sftp = await openSftp(serverId)
      return new Promise((resolve, reject) => {
        const stream = sftp.createWriteStream(remotePath)
        stream.on('error', reject)
        stream.on('close', () => resolve())
        stream.end(content, 'utf-8')
      })
    }
  )

  ipcMain.handle(
    'sftp:rename',
    async (_event, serverId: string, oldPath: string, newPath: string): Promise<void> => {
      const sftp = await openSftp(serverId)
      return new Promise((resolve, reject) => {
        sftp.rename(oldPath, newPath, (err) => (err ? reject(err) : resolve()))
      })
    }
  )

  ipcMain.handle(
    'sftp:remove',
    async (_event, serverId: string, remotePath: string, isDirectory: boolean): Promise<void> => {
      const sftp = await openSftp(serverId)
      return new Promise((resolve, reject) => {
        const callback = (err?: Error | null): void => (err ? reject(err) : resolve())
        if (isDirectory) sftp.rmdir(remotePath, callback)
        else sftp.unlink(remotePath, callback)
      })
    }
  )
}
