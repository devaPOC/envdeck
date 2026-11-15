import { useServerStore } from '../../store/serverStore'
import { StatusDot } from './StatusDot'

export function ServerList(): JSX.Element {
  const servers = useServerStore((state) => state.servers)
  const activeServerId = useServerStore((state) => state.activeServerId)
  const setActiveServer = useServerStore((state) => state.setActiveServer)

  return (
    <div className="flex flex-col gap-1 p-2">
      {servers.map((server) => (
        <button
          key={server.id}
          onClick={() => setActiveServer(server.id)}
          className={`flex items-center gap-2 rounded px-2 py-1.5 text-left text-sm hover:bg-neutral-800 ${
            activeServerId === server.id ? 'bg-neutral-800' : ''
          }`}
        >
          <StatusDot status={server.status} />
          <span className="truncate">{server.name}</span>
        </button>
      ))}
      {/* TODO: "Add Server" button opens a form for name, host, username, PEM key */}
    </div>
  )
}
