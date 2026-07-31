import { formatElapsedTime } from '../utils/streamTimer'

type FocusModeHeaderProps = {
  streamTitle: string
  elapsedSeconds: number
  isTimerRunning: boolean
  checklistTotal: number
  incompleteChecklistCount: number
  onStartTimer: () => void
  onPauseTimer: () => void
  onExit: () => void
}

function FocusModeHeader({
  streamTitle,
  elapsedSeconds,
  isTimerRunning,
  checklistTotal,
  incompleteChecklistCount,
  onStartTimer,
  onPauseTimer,
  onExit,
}: FocusModeHeaderProps) {
  const completedChecklistCount =
    checklistTotal - incompleteChecklistCount

  const formattedTime =
    formatElapsedTime(elapsedSeconds)

  return (
    <article className="panel focus-mode-header">
      <div className="focus-mode-heading">
        <div>
          <span className="focus-mode-label">
            集中モード
          </span>

          <h2>
            {streamTitle.trim() || '配信中'}
          </h2>
        </div>

        <button
          type="button"
          className="focus-mode-exit-button"
          onClick={onExit}
        >
          通常表示に戻る
        </button>
      </div>

      <div className="focus-mode-status">
        <span className="focus-mode-live-badge">
          配信中
        </span>

        <span>
          {checklistTotal === 0
            ? '準備項目なし'
            : `準備 ${completedChecklistCount}/${checklistTotal}`}
        </span>

        <span>
          {isTimerRunning
            ? 'タイマー計測中'
            : 'タイマー停止中'}
        </span>
      </div>

      <div
        className="focus-mode-timer"
        role="timer"
        aria-label={`経過時間 ${formattedTime}`}
        aria-live="off"
      >
        {formattedTime}
      </div>

      <button
        type="button"
        className="focus-mode-timer-button"
        onClick={
          isTimerRunning
            ? onPauseTimer
            : onStartTimer
        }
      >
        {isTimerRunning
          ? 'タイマーを一時停止'
          : 'タイマーを再開'}
      </button>
    </article>
  )
}

export default FocusModeHeader