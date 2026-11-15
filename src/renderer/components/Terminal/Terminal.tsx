import { useEffect, useRef } from 'react'
import { Terminal as XTerm } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import '@xterm/xterm/css/xterm.css'
import type { TerminalSession } from '../../store/terminalStore'

export function Terminal({ session }: { session: TerminalSession }): JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const term = new XTerm({
      cursorBlink: true,
      fontSize: 13,
      theme: { background: '#0a0a0a' }
    })
    const fitAddon = new FitAddon()
    term.loadAddon(fitAddon)
    term.open(container)
    fitAddon.fit()

    void window.electronAPI.terminal.open(session.id, session.serverId, term.cols, term.rows)

    const unsubscribeData = window.electronAPI.terminal.onData(({ terminalId, data }) => {
      if (terminalId === session.id) term.write(data)
    })
    const unsubscribeClosed = window.electronAPI.terminal.onClosed(({ terminalId }) => {
      if (terminalId === session.id) {
        term.write('\r\n\x1b[31m[session closed]\x1b[0m\r\n')
      }
    })
    const inputDisposable = term.onData((data) => {
      window.electronAPI.terminal.input(session.id, data)
    })

    function handleResize(): void {
      fitAddon.fit()
      window.electronAPI.terminal.resize(session.id, term.cols, term.rows)
    }
    const resizeObserver = new ResizeObserver(handleResize)
    resizeObserver.observe(container)

    return () => {
      resizeObserver.disconnect()
      inputDisposable.dispose()
      unsubscribeData()
      unsubscribeClosed()
      void window.electronAPI.terminal.close(session.id)
      term.dispose()
    }
    // Each terminal tab owns exactly one xterm instance + one shell session
    // for its whole life — this effect intentionally runs once per session id.
  }, [session.id, session.serverId])

  return <div ref={containerRef} className="h-full w-full p-1" />
}
