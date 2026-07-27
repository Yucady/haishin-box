import type { StreamStatus } from '../../types/streamSession'

type StreamStatusControlProps = {
  status: StreamStatus
  scheduledTimePassed: boolean
  onChange: (status: StreamStatus) => void
}

const STATUS_OPTIONS: {
  value: StreamStatus
  label: string
}[] = [
  { value: 'preparing', label: '準備中' },
  { value: 'live', label: '配信中' },
  { value: 'ended', label: '終了' },
]

function StreamStatusControl({
  status,
  scheduledTimePassed,
  onChange,
}: StreamStatusControlProps) {
  return (
    <div className="stream-status-field">
      <span className="stream-session-label">
        配信状態
      </span>

      <div
        className="stream-status-buttons"
        role="group"
        aria-label="配信状態"
      >
        {STATUS_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            className={
              status === option.value
                ? 'stream-status-button active'
                : 'stream-status-button'
            }
            aria-pressed={status === option.value}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>

      {scheduledTimePassed && status === 'preparing' && (
        <p className="stream-status-warning">
          開始予定時刻を過ぎています。配信状態を確認してください。
        </p>
      )}
    </div>
  )
}

export default StreamStatusControl