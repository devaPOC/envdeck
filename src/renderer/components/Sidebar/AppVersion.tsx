import { useEffect, useState } from 'react'

export function AppVersion(): JSX.Element {
  const [version, setVersion] = useState<string | null>(null)

  useEffect(() => {
    window.electronAPI.app.getVersion().then(setVersion)
  }, [])

  return <span className="text-xs text-neutral-600">v{version ?? '…'}</span>
}
