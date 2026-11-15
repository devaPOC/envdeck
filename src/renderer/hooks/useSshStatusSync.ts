import { useEffect } from 'react'
import { useServerStore } from '../store/serverStore'

export function useSshStatusSync(): void {
  const setStatus = useServerStore((state) => state.setStatus)

  useEffect(() => {
    return window.electronAPI.ssh.onStatusChange(({ serverId, status, message }) => {
      setStatus(serverId, status, message)
    })
  }, [setStatus])
}
