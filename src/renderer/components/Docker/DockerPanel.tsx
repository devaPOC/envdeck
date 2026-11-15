import { useServerStore } from '../../store/serverStore'

export function DockerPanel({ serverId }: { serverId: string }): JSX.Element {
  const serverName = useServerStore((state) => state.servers.find((s) => s.id === serverId)?.name)

  // TODO: call window.electronAPI.docker.listContainers(serverId), render start/stop/restart controls
  return (
    <div className="p-3 text-sm text-neutral-400">
      Docker containers for server {serverName ?? serverId}
    </div>
  )
}
