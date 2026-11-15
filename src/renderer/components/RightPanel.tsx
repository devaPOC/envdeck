import { useState } from 'react'
import { useServerStore } from '../store/serverStore'
import { DockerPanel } from './Docker/DockerPanel'
import { EnvDiff } from './EnvDiff/EnvDiff'

type Tab = 'docker' | 'diff'

export function RightPanel(): JSX.Element | null {
  const [open, setOpen] = useState(true)
  const [tab, setTab] = useState<Tab>('docker')
  const activeServerId = useServerStore((state) => state.activeServerId)

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-6 border-l border-neutral-800 bg-neutral-900 text-xs text-neutral-500"
      >
        ‹
      </button>
    )
  }

  return (
    <aside className="flex w-80 flex-col border-l border-neutral-800 bg-neutral-900">
      <div className="flex items-center justify-between border-b border-neutral-800">
        <div className="flex">
          {(['docker', 'diff'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-1.5 text-sm capitalize ${
                tab === t ? 'bg-neutral-800' : 'text-neutral-500'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <button onClick={() => setOpen(false)} className="px-2 text-neutral-500">
          ›
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {tab === 'docker' && activeServerId && <DockerPanel serverId={activeServerId} />}
        {tab === 'diff' && <EnvDiff />}
      </div>
    </aside>
  )
}
