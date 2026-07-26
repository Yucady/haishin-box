import {
  useEffect,
  useRef,
  useState,
} from 'react'

function formatTime(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600)

  const minutes = Math.floor(
    (totalSeconds % 3600) / 60,
  )

  const seconds = totalSeconds % 60

  return [hours, minutes, seconds]
    .map((value) => String(value).padStart(2, '0'))
    .join(':')
}

function TimerPanel() {
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [isRunning, setIsRunning] = useState(false)

  const startTimeRef = useRef<number | null>(null)

  useEffect(() => {
    if (!isRunning) {
      return
    }

    const intervalId = window.setInterval(() => {
      if (startTimeRef.current === null) {
        return
      }

      const elapsedMilliseconds =
        Date.now() - startTimeRef.current

      setElapsedSeconds(
        Math.floor(elapsedMilliseconds / 1000),
      )
    }, 250)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [isRunning])

  function startTimer() {
    if (isRunning) {
      return
    }

    startTimeRef.current =
      Date.now() - elapsedSeconds * 1000

    setIsRunning(true)
  }

  function pauseTimer() {
    setIsRunning(false)
    startTimeRef.current = null
  }

  function resetTimer() {
    setIsRunning(false)
    setElapsedSeconds(0)
    startTimeRef.current = null
  }

  return (
    <article className="panel">
      <h2>配信タイマー</h2>

      <p
        className="timer"
        aria-label={`経過時間 ${formatTime(elapsedSeconds)}`}
      >
        {formatTime(elapsedSeconds)}
      </p>

      <div className="timer-buttons">
        <button
          type="button"
          onClick={startTimer}
          disabled={isRunning}
        >
          開始
        </button>

        <button
          type="button"
          onClick={pauseTimer}
          disabled={!isRunning}
        >
          一時停止
        </button>

        <button
          type="button"
          onClick={resetTimer}
          disabled={elapsedSeconds === 0 && !isRunning}
        >
          リセット
        </button>
      </div>

      <div className="timer-status" aria-live="polite">
        {isRunning ? '計測中' : '停止中'}
      </div>
    </article>
  )
}

export default TimerPanel