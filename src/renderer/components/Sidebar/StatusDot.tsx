import type { ConnectionStatus } from '../../store/serverStore'

const COLORS: Record<ConnectionStatus, string> = {
  connected: 'bg-green-500',
  connecting: 'bg-yellow-500',
  error: 'bg-red-500',
  disconnected: 'bg-neutral-600'
}

export function StatusDot({ status }: { status: ConnectionStatus }): JSX.Element {
  return <span className={`h-2 w-2 shrink-0 rounded-full ${COLORS[status]}`} />
}
