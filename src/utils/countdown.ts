export type CountdownResult = {
  totalMilliseconds: number
  days: number
  hours: number
  minutes: number
  seconds: number
  hasStarted: boolean
}

export const calculateCountdown = (
  scheduledAt: string,
  currentTime = Date.now(),
): CountdownResult | null => {
  if (!scheduledAt) {
    return null
  }

  const targetTime = new Date(scheduledAt).getTime()

  if (Number.isNaN(targetTime)) {
    return null
  }

  const difference = targetTime - currentTime
  const totalMilliseconds = Math.max(0, difference)
  const totalSeconds = Math.floor(totalMilliseconds / 1000)

  const days = Math.floor(totalSeconds / 86_400)
  const hours = Math.floor((totalSeconds % 86_400) / 3_600)
  const minutes = Math.floor((totalSeconds % 3_600) / 60)
  const seconds = totalSeconds % 60

  return {
    totalMilliseconds,
    days,
    hours,
    minutes,
    seconds,
    hasStarted: difference <= 0,
  }
}

export const formatCountdown = (
  countdown: CountdownResult,
): string => {
  if (countdown.hasStarted) {
    return '配信開始時刻になりました'
  }

  const time = [countdown.hours, countdown.minutes, countdown.seconds]
    .map((value) => value.toString().padStart(2, '0'))
    .join(':')

  if (countdown.days > 0) {
    return `${countdown.days}日 ${time}`
  }

  return time
}