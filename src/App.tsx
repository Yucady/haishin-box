import ChecklistPanel from './components/ChecklistPanel'
import MemoPanel from './components/MemoPanel'
import QuickLinkPanel from './components/QuickLinkPanel'
import SettingsPanel from './components/SettingsPanel'
import TextTemplatePanel from './components/TextTemplatePanel'
import TimerPanel from './components/TimerPanel'
import XPostPanel from './components/XPostPanel'
import './App.css'

function App() {
  return (
    <main className="app">
      <header className="app-header">
        <p>配信者向けシンプルツール</p>
        <h1>配信準備BOX</h1>
        <p>配信前の準備を一か所で確認できます。</p>
      </header>

      <section className="dashboard">
        <ChecklistPanel />

        <TimerPanel />

        <TextTemplatePanel />

        <QuickLinkPanel />

        <XPostPanel />

        <MemoPanel />

        <SettingsPanel />
      </section>
    </main>
  )
}

export default App