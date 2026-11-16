import { useState } from 'react'
import { Info, Keyboard } from 'lucide-react'
import { ServerList } from './ServerList'
import { AppVersion } from './AppVersion'
import { FileTree } from '../FileTree/FileTree'
import { ShortcutsModal } from '../ShortcutsModal'
import { useServerStore } from '../../store/serverStore'

export function Sidebar(): JSX.Element {
  const activeServerId = useServerStore((state) => state.activeServerId)
  const [showShortcuts, setShowShortcuts] = useState(false)

  return (
    <aside className="flex w-64 flex-col border-r border-neutral-800 bg-neutral-900">
      <ServerList />
      {activeServerId && <FileTree serverId={activeServerId} />}

      <div className="mt-auto flex items-center justify-between border-t border-neutral-800 px-2 py-1.5">
        <AppVersion />
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowShortcuts(true)}
            title="Keyboard shortcuts"
            className="rounded p-1 text-neutral-500 hover:bg-neutral-800 hover:text-neutral-200"
          >
            <Keyboard size={14} />
          </button>
          <button
            onClick={() => void window.electronAPI.app.showAbout()}
            title="About EnvDeck"
            className="rounded p-1 text-neutral-500 hover:bg-neutral-800 hover:text-neutral-200"
          >
            <Info size={14} />
          </button>
        </div>
      </div>

      {showShortcuts && <ShortcutsModal onClose={() => setShowShortcuts(false)} />}
    </aside>
  )
}
