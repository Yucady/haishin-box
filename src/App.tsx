import { useEffect, useState } from 'react'

import ChecklistPanel from './components/ChecklistPanel'
import FocusModeView from './components/FocusModeView'
import MemoPanel from './components/MemoPanel'
import QuickLinkPanel from './components/QuickLinkPanel'
import SettingsPanel from './components/SettingsPanel'
import StreamSessionPanel from './components/StreamSessionPanel'
import StreamStartControl from './components/StreamStartControl'
import TextTemplatePanel from './components/TextTemplatePanel'
import TimerPanel from './components/TimerPanel'
import XPostPanel from './components/XPostPanel'
import OnboardingDialog from './components/OnboardingDialog'
import PwaStatus from './components/PwaStatus'
import AppFooter from './components/AppFooter'
import { STORAGE_KEYS } from './constants/storageKeys'
import useChecklist from './hooks/useChecklist'
import useStreamTimer from './hooks/useStreamTimer'
import useXPostDraft from './hooks/useXPostDraft'
import { useOnboarding } from './hooks/useOnboarding'
import usePwaExperience from './hooks/usePwaExperience'
import {
  createEmptyStreamSession,
  type StreamSession,
} from './types/streamSession'
import { createStreamStartPlan } from './utils/streamStart'
import { getStreamUrlError } from './utils/streamSessionValidation'
import './App.css'

function App() {
  const {
    isOnboardingOpen,
    completeOnboarding,
    openOnboarding,
  } = useOnboarding()
  const {
    isOnline,
    canInstall,
    isUpdateAvailable,
    installApp,
    reloadForUpdate,
  } = usePwaExperience()

  const {
    checklist,
    incompleteChecklistItems,
    addChecklistItem,
    toggleChecklistItem,
    resetChecklist,
    deleteChecklistItem,
  } = useChecklist()

  const {
    elapsedSeconds,
    isRunning: isTimerRunning,
    startTimer,
    pauseTimer,
    resetTimer,
  } = useStreamTimer()

  const {
    xPostDraft,
    setXPostDraft,
  } = useXPostDraft()

  const [isFocusMode, setIsFocusMode] =
    useState(false)

  const [streamSession, setStreamSession] =
    useState<StreamSession>(() => {
      const savedSession = localStorage.getItem(
        STORAGE_KEYS.streamSession,
      )

      if (!savedSession) {
        return createEmptyStreamSession()
      }

      try {
        const parsedSession: unknown =
          JSON.parse(savedSession)

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

  const isFocusModeActive =
    isFocusMode &&
    streamSession.status === 'live'

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEYS.streamSession,
      JSON.stringify(streamSession),
    )
  }, [streamSession])

  function resetStreamSession() {
    setIsFocusMode(false)
    setStreamSession(createEmptyStreamSession())
  }

  function startStream() {
    const streamUrlError = getStreamUrlError(
      streamSession.streamUrl,
    )

    if (streamUrlError) {
      window.alert(
        `配信URLを確認してください。\n${streamUrlError}`,
      )
      return
    }

    if (incompleteChecklistItems.length > 0) {
      const incompleteList =
        incompleteChecklistItems
          .map((item) => `・${item.text}`)
          .join('\n')

      const shouldContinue = window.confirm(
        `未完了の準備項目があります。\n\n${incompleteList}\n\nこのまま配信を開始しますか？`,
      )

      if (!shouldContinue) {
        return
      }
    }

    const startPlan =
      createStreamStartPlan(streamSession)

    if (
      xPostDraft.trim() !== '' &&
      xPostDraft !== startPlan.xPostDraft
    ) {
      const shouldReplaceDraft = window.confirm(
        '現在のX投稿下書きを、配信開始のお知らせで置き換えますか？',
      )

      if (!shouldReplaceDraft) {
        return
      }
    }

    setStreamSession(startPlan.streamSession)
    startTimer()
    setXPostDraft(startPlan.xPostDraft)
  }

    return (
      <>
        <main
          className={
            isFocusModeActive
              ? 'app focus-mode-active'
              : 'app'
          }
          aria-hidden={
            isOnboardingOpen ? true : undefined
          }
        >
      {!isFocusModeActive && (
        <header className="app-header">
          <p>配信者向けシンプルツール</p>
          <h1>配信準備BOX</h1>
          <p className="app-header-description">
            配信前の準備を一か所で確認できます。
          </p>

          <button
            className="app-help-button"
            type="button"
            onClick={openOnboarding}
            aria-haspopup="dialog"
          >
            <span aria-hidden="true">?</span>
            使い方
          </button>
        </header>
      )}

      <section className="dashboard">
        {isFocusModeActive ? (
          <FocusModeView
            streamTitle={streamSession.title}
            elapsedSeconds={elapsedSeconds}
            isTimerRunning={isTimerRunning}
            checklist={checklist}
            incompleteChecklistCount={
              incompleteChecklistItems.length
            }
            onStartTimer={startTimer}
            onPauseTimer={pauseTimer}
            onAddChecklistItem={
              addChecklistItem
            }
            onToggleChecklistItem={
              toggleChecklistItem
            }
            onResetChecklist={resetChecklist}
            onDeleteChecklistItem={
              deleteChecklistItem
            }
            onExit={() => setIsFocusMode(false)}
          />
        ) : (
          <>
            <StreamStartControl
              checklistTotal={checklist.length}
              incompleteChecklistCount={
                incompleteChecklistItems.length
              }
              isTimerRunning={isTimerRunning}
              isLive={
                streamSession.status === 'live'
              }
              hasXPostDraft={
                xPostDraft.trim() !== ''
              }
              onStart={startStream}
              onEnterFocusMode={() =>
                setIsFocusMode(true)
              }
            />

            <div className="dashboard-row">
              <StreamSessionPanel
                session={streamSession}
                onChange={setStreamSession}
                onReset={resetStreamSession}
              />

              <ChecklistPanel
                checklist={checklist}
                onAddItem={addChecklistItem}
                onToggleItem={
                  toggleChecklistItem
                }
                onReset={resetChecklist}
                onDeleteItem={
                  deleteChecklistItem
                }
              />
            </div>

            <div className="dashboard-row">
              <div className="dashboard-column">
                <TimerPanel
                  elapsedSeconds={elapsedSeconds}
                  isRunning={isTimerRunning}
                  onStart={startTimer}
                  onPause={pauseTimer}
                  onReset={resetTimer}
                />

                <QuickLinkPanel />
              </div>

              <TextTemplatePanel
                streamSession={streamSession}
              />
            </div>

            <XPostPanel
              streamSession={streamSession}
              postText={xPostDraft}
              onPostTextChange={setXPostDraft}
            />

            <MemoPanel />

            <SettingsPanel />
          </>
        )}
      </section>

      {!isFocusModeActive && <AppFooter />}

      <PwaStatus
        isOnline={isOnline}
        canInstall={canInstall}
        isUpdateAvailable={isUpdateAvailable}
        onInstall={installApp}
        onReloadForUpdate={reloadForUpdate}
      />

      </main>

      <OnboardingDialog
        isOpen={isOnboardingOpen}
        onComplete={completeOnboarding}
      />
    </>
  )
}

export default App