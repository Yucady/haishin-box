import type { ChecklistItem } from '../types/checklist'
import ChecklistPanel from './ChecklistPanel'
import FocusModeHeader from './FocusModeHeader'
import MemoPanel from './MemoPanel'
import QuickLinkPanel from './QuickLinkPanel'

type FocusModeViewProps = {
  streamTitle: string
  elapsedSeconds: number
  isTimerRunning: boolean
  checklist: readonly ChecklistItem[]
  incompleteChecklistCount: number
  onStartTimer: () => void
  onPauseTimer: () => void
  onAddChecklistItem: (text: string) => boolean
  onToggleChecklistItem: (id: string) => void
  onResetChecklist: () => void
  onDeleteChecklistItem: (id: string) => void
  onExit: () => void
}

function FocusModeView({
  streamTitle,
  elapsedSeconds,
  isTimerRunning,
  checklist,
  incompleteChecklistCount,
  onStartTimer,
  onPauseTimer,
  onAddChecklistItem,
  onToggleChecklistItem,
  onResetChecklist,
  onDeleteChecklistItem,
  onExit,
}: FocusModeViewProps) {
  return (
    <section
      className="focus-mode-view"
      aria-label="集中モード"
    >
      <FocusModeHeader
        streamTitle={streamTitle}
        elapsedSeconds={elapsedSeconds}
        isTimerRunning={isTimerRunning}
        checklistTotal={checklist.length}
        incompleteChecklistCount={
          incompleteChecklistCount
        }
        onStartTimer={onStartTimer}
        onPauseTimer={onPauseTimer}
        onExit={onExit}
      />

      <div className="focus-mode-grid">
        <ChecklistPanel
          checklist={checklist}
          onAddItem={onAddChecklistItem}
          onToggleItem={onToggleChecklistItem}
          onReset={onResetChecklist}
          onDeleteItem={onDeleteChecklistItem}
        />

        <QuickLinkPanel />
      </div>

      <MemoPanel />
    </section>
  )
}

export default FocusModeView