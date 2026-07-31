import {
  useEffect,
  useRef,
  useState,
} from 'react'

import { calculateElapsedSeconds } from '../utils/streamTimer'

function useStreamTimer() {
  const [elapsedSeconds, setElapsedSeconds] =
    useState(0)

  const [isRunning, setIsRunning] =
    useState(false)

  const startTimeRef = useRef<number | null>(null)

  useEffect(() => {
    if (!isRunning) {
      return
    }

    const intervalId = window.setInterval(() => {
      if (startTimeRef.current === null) {
        return
      }

      setElapsedSeconds(
        calculateElapsedSeconds(
          startTimeRef.current,
        ),
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

  return {
    elapsedSeconds,
    isRunning,
    startTimer,
    pauseTimer,
    resetTimer,
  }
}

export default useStreamTimer