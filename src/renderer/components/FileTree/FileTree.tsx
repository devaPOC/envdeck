export function FileTree({ serverId }: { serverId: string }): JSX.Element {
  // TODO: call window.electronAPI.sftp.listDir(serverId, path) and render an expand/collapse tree
  return (
    <div className="flex-1 overflow-y-auto border-t border-neutral-800 p-2 text-sm text-neutral-400">
      File tree for server {serverId}
    </div>
  )
}
