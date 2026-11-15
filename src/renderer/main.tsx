import React from 'react'
import ReactDOM from 'react-dom/client'
import { loader } from '@monaco-editor/react'
import * as monaco from 'monaco-editor'
import App from './App'
import './index.css'

// Use the bundled monaco-editor package instead of @monaco-editor/react's
// CDN default — a CDN fetch would be blocked by our CSP anyway, and this
// app is meant to work fully offline once connected to a server.
loader.config({ monaco })

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
