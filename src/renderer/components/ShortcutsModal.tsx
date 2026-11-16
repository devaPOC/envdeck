const SHORTCUTS: { keys: string; description: string }[] = [
  { keys: '⌘S', description: 'Save the active file' }
]

export function ShortcutsModal({ onClose }: { onClose: () => void }): JSX.Element {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-80 rounded-lg border border-neutral-800 bg-neutral-900 p-4">
        <div className="flex items-center justify-between pb-3">
          <h2 className="text-sm font-semibold text-neutral-100">Keyboard Shortcuts</h2>
          <button onClick={onClose} className="text-neutral-500 hover:text-neutral-200">
            ×
          </button>
        </div>
        <div className="flex flex-col gap-2">
          {SHORTCUTS.map((shortcut) => (
            <div key={shortcut.keys} className="flex items-center justify-between text-sm">
              <span className="text-neutral-400">{shortcut.description}</span>
              <kbd className="rounded border border-neutral-700 bg-neutral-950 px-1.5 py-0.5 font-mono text-xs text-neutral-300">
                {shortcut.keys}
              </kbd>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
