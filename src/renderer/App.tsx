import { Sidebar } from './components/Sidebar/Sidebar'
import { EditorTabs } from './components/Editor/EditorTabs'
import { RightPanel } from './components/RightPanel'

function App(): JSX.Element {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-neutral-950 text-neutral-100">
      <Sidebar />
      <main className="flex-1 overflow-hidden">
        <EditorTabs />
      </main>
      <RightPanel />
    </div>
  )
}

export default App
