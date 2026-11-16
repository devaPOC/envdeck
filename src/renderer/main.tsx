import ReactDOM from 'react-dom/client'
import { loader } from '@monaco-editor/react'
import * as monaco from 'monaco-editor'
import App from './App'
import { ErrorBoundary } from './components/ErrorBoundary'
import './index.css'

// Use the bundled monaco-editor package instead of @monaco-editor/react's
// CDN default — a CDN fetch would be blocked by our CSP anyway, and this
// app is meant to work fully offline once connected to a server.
loader.config({ monaco })

// No <React.StrictMode> here: its deliberate double-invoke of effects in dev
// is meant to catch web apps relying on effects to be re-run-safe ahead of
// concurrent rendering features. It doesn't fit a single-window Electron app
// that opens real external resources in effects (e.g. Terminal's SSH shell
// channel) — double-invoking that opens two live shells against one tab.
ReactDOM.createRoot(document.getElementById('root')!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
)
