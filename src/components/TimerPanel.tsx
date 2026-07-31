import { formatElapsedTime } from '../utils/streamTimer'

type TimerPanelProps = {
  elapsedSeconds: number
  isRunning: boolean
  onStart: () => void
  onPause: () => void
  onReset: () => void
}

function TimerPanel({
  elapsedSeconds,
  isRunning,
  onStart,
  onPause,
  onReset,
}: TimerPanelProps) {
  const formattedTime =
    formatElapsedTime(elapsedSeconds)

  return (
    <article className="panel">
      <h2>配信タイマー</h2>

      <p
        className="timer"
        aria-label={`経過時間 ${formattedTime}`}
      >
        {formattedTime}
      </p>

      <div className="timer-buttons">
        <button
          type="button"
          onClick={onStart}
          disabled={isRunning}
        >
          開始
        </button>

        <button
          type="button"
          onClick={onPause}
          disabled={!isRunning}
        >
          一時停止
        </button>

        <button
          type="button"
          onClick={onReset}
          disabled={
            elapsedSeconds === 0 && !isRunning
          }
        >
          リセット
        </button>
      </div>

      <div
        className="timer-status"
        aria-live="polite"
      >
        {isRunning ? '計測中' : '停止中'}
      </div>
    </article>
  )
}

export default TimerPanel