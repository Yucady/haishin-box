import { formatCountdown } from '../../utils/countdown'
import type { calculateCountdown } from '../../utils/countdown'

type Countdown = NonNullable<
  ReturnType<typeof calculateCountdown>
>

type StreamCountdownProps = {
  countdown: Countdown
}

function StreamCountdown({
  countdown,
}: StreamCountdownProps) {
  return (
    <div
      className={
        countdown.hasStarted
          ? 'stream-countdown started'
          : 'stream-countdown'
      }
      role="timer"
      aria-live="polite"
    >
      <span>
        {countdown.hasStarted
          ? '配信開始'
          : '配信開始まで'}
      </span>

      <strong>{formatCountdown(countdown)}</strong>
    </div>
  )
}

export default StreamCountdown