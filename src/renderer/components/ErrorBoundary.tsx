import { Component, type ReactNode } from 'react'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  error: Error | null
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error }
  }

  componentDidCatch(error: Error, info: { componentStack: string }): void {
    console.error('Unhandled renderer error:', error, info.componentStack)
  }

  render(): ReactNode {
    if (!this.state.error) return this.props.children

    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center gap-4 bg-neutral-950 p-8 text-center text-neutral-100">
        <h1 className="text-lg font-semibold">Something went wrong</h1>
        <p className="max-w-md text-sm text-neutral-400">
          EnvDeck hit an unexpected error and couldn&apos;t continue. Your open SSH connections and
          terminal sessions live in a separate process and aren&apos;t affected — reloading should
          recover the window.
        </p>
        <pre className="max-h-40 max-w-lg overflow-auto rounded border border-neutral-800 bg-neutral-900 p-3 text-left text-xs text-red-400">
          {this.state.error.message}
        </pre>
        <button
          onClick={() => location.reload()}
          className="rounded bg-neutral-800 px-4 py-2 text-sm text-neutral-200 hover:bg-neutral-700"
        >
          Reload
        </button>
      </div>
    )
  }
}
