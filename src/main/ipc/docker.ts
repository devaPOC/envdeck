import { ipcMain } from 'electron'
import { execCommand } from './ssh'

export type DockerAction = 'start' | 'stop' | 'restart'

export interface DockerContainer {
  id: string
  name: string
  image: string
  status: string
  ports: string
  running: boolean
}

const CONTAINER_ID_PATTERN = /^[a-zA-Z0-9][a-zA-Z0-9_.-]*$/
const VALID_ACTIONS: DockerAction[] = ['start', 'stop', 'restart']

function assertValidContainerId(id: string): void {
  if (!CONTAINER_ID_PATTERN.test(id)) {
    throw new Error('Invalid container id')
  }
}

function friendlyDockerError(stderr: string, code: number | null): string {
  if (code === 127 || /command not found/i.test(stderr)) {
    return 'Docker is not installed on this server (or not in PATH)'
  }
  if (/permission denied/i.test(stderr)) {
    return 'Permission denied running Docker — try a user in the docker group, or with sudo'
  }
  return stderr.trim() || 'Docker command failed'
}

export function registerDockerHandlers(): void {
  ipcMain.handle('docker:list', async (_event, serverId: string): Promise<DockerContainer[]> => {
    const { stdout, stderr, code } = await execCommand(
      serverId,
      "docker ps -a --format '{{json .}}'"
    )
    if (code !== 0) throw new Error(friendlyDockerError(stderr, code))

    return stdout
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .flatMap((line) => {
        try {
          const raw = JSON.parse(line)
          const container: DockerContainer = {
            id: raw.ID,
            name: raw.Names,
            image: raw.Image,
            status: raw.Status,
            ports: raw.Ports ?? '',
            running: /^up/i.test(raw.Status ?? '')
          }
          return [container]
        } catch {
          return []
        }
      })
  })

  ipcMain.handle(
    'docker:action',
    async (_event, serverId: string, containerId: string, action: DockerAction): Promise<void> => {
      assertValidContainerId(containerId)
      if (!VALID_ACTIONS.includes(action)) throw new Error('Invalid action')

      const { stderr, code } = await execCommand(serverId, `docker ${action} ${containerId}`)
      if (code !== 0) throw new Error(friendlyDockerError(stderr, code))
    }
  )

  ipcMain.handle(
    'docker:logs',
    async (_event, serverId: string, containerId: string, tailLines?: number): Promise<string> => {
      assertValidContainerId(containerId)
      if (tailLines !== undefined && (!Number.isInteger(tailLines) || tailLines <= 0)) {
        throw new Error('Invalid tail line count')
      }

      // No tailLines → fetch the whole log so the renderer can paginate it
      // client-side without re-running this over SSH on every page turn.
      const tailFlag = tailLines !== undefined ? `--tail ${tailLines} ` : ''
      const { stdout, stderr, code } = await execCommand(
        serverId,
        `docker logs ${tailFlag}${containerId} 2>&1`
      )
      if (code !== 0) throw new Error(friendlyDockerError(stderr, code))
      return stdout
    }
  )
}
