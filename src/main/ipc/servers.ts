import { ipcMain } from 'electron'
import Store from 'electron-store'
import { randomUUID } from 'crypto'
import { savePemKey, deletePemKey } from '../keychain'

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

interface ServerStoreSchema {
  servers: ServerRecord[]
}

const store = new Store<ServerStoreSchema>({ name: 'servers', defaults: { servers: [] } })

export function registerServerHandlers(): void {
  ipcMain.handle('servers:list', async (): Promise<ServerRecord[]> => {
    return store.get('servers')
  })

  ipcMain.handle('servers:add', async (_event, input: ServerInput): Promise<ServerRecord> => {
    const record: ServerRecord = {
      id: randomUUID(),
      name: input.name,
      host: input.host,
      username: input.username
    }
    await savePemKey(record.id, input.pemKey)
    store.set('servers', [...store.get('servers'), record])
    return record
  })

  ipcMain.handle(
    'servers:update',
    async (_event, id: string, input: Partial<ServerInput>): Promise<ServerRecord> => {
      const servers = store.get('servers')
      const existing = servers.find((s) => s.id === id)
      if (!existing) throw new Error('Server not found')

      const updated: ServerRecord = {
        id,
        name: input.name ?? existing.name,
        host: input.host ?? existing.host,
        username: input.username ?? existing.username
      }
      store.set(
        'servers',
        servers.map((s) => (s.id === id ? updated : s))
      )
      if (input.pemKey) await savePemKey(id, input.pemKey)
      return updated
    }
  )

  ipcMain.handle('servers:remove', async (_event, id: string): Promise<void> => {
    store.set(
      'servers',
      store.get('servers').filter((s) => s.id !== id)
    )
    await deletePemKey(id)
  })
}
