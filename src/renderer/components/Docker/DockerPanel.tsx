export function DockerPanel({ serverId }: { serverId: string }): JSX.Element {
  // TODO: call window.electronAPI.docker.listContainers(serverId), render start/stop/restart controls
  return (
    <div className="p-3 text-sm text-neutral-400">Docker containers for server {serverId}</div>
  )
}
