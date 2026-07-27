import { useEffect, useState } from 'react'
import ChecklistPanel from './components/ChecklistPanel'
import MemoPanel from './components/MemoPanel'
import QuickLinkPanel from './components/QuickLinkPanel'
import SettingsPanel from './components/SettingsPanel'
import StreamSessionPanel from './components/StreamSessionPanel'
import TextTemplatePanel from './components/TextTemplatePanel'
import TimerPanel from './components/TimerPanel'
import XPostPanel from './components/XPostPanel'
import { STORAGE_KEYS } from './constants/storageKeys'
import './App.css'
import {
  createEmptyStreamSession,
  type StreamSession,
} from './types/streamSession'

function App() {
  const [streamSession, setStreamSession] = useState<StreamSession>(() => {
    const savedSession = localStorage.getItem(STORAGE_KEYS.streamSession)

    if (!savedSession) {
      return createEmptyStreamSession()
    }

    try {
      const parsedSession: unknown = JSON.parse(savedSession)

      if (
        !parsedSession ||
        typeof parsedSession !== 'object' ||
        Array.isArray(parsedSession)
      ) {
        return createEmptyStreamSession()
      }

      return {
        ...createEmptyStreamSession(),
        ...(parsedSession as Partial<StreamSession>),
      }
    } catch {
      return createEmptyStreamSession()
    }
  })

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEYS.streamSession,
      JSON.stringify(streamSession),
    )
  }, [streamSession])

  const resetStreamSession = () => {
    setStreamSession(createEmptyStreamSession())
  }

  return (
    <main className="app">
      <header className="app-header">
        <p>配信者向けシンプルツール</p>
        <h1>配信準備BOX</h1>
        <p>配信前の準備を一か所で確認できます。</p>
      </header>

      <section className="dashboard">
        <div className="dashboard-row">
          <StreamSessionPanel
            session={streamSession}
            onChange={setStreamSession}
            onReset={resetStreamSession}
          />

          <ChecklistPanel />
        </div>

        <div className="dashboard-row">
          <div className="dashboard-column">
            <TimerPanel />

            <QuickLinkPanel />
          </div>

          <TextTemplatePanel
            streamSession={streamSession}
          />
        </div>

        <XPostPanel streamSession={streamSession} />

        <MemoPanel />

        <SettingsPanel />
      </section>
    </main>
  )
}

export default App