export function Terminal({ serverId }: { serverId: string }): JSX.Element {
  // TODO: mount xterm.js, pipe input/output through window.electronAPI.ssh.exec / a dedicated shell channel
  return (
    <div className="flex h-full items-center justify-center bg-black text-sm text-neutral-400">
      Terminal for server {serverId}
    </div>
  )
}
