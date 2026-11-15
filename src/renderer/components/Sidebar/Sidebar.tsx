import { ServerList } from './ServerList'
import { FileTree } from '../FileTree/FileTree'
import { useServerStore } from '../../store/serverStore'

export function Sidebar(): JSX.Element {
  const activeServerId = useServerStore((state) => state.activeServerId)

  return (
    <aside className="flex w-64 flex-col border-r border-neutral-800 bg-neutral-900">
      <ServerList />
      {activeServerId && <FileTree serverId={activeServerId} />}
    </aside>
  )
}
