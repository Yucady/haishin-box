export function calculateElapsedSeconds(
  startTime: number,
  currentTime = Date.now(),
): number {
  const elapsedMilliseconds = Math.max(
    0,
    currentTime - startTime,
  )

  return Math.floor(elapsedMilliseconds / 1000)
}

export function formatElapsedTime(
  totalSeconds: number,
): string {
  const safeTotalSeconds = Math.max(
    0,
    Math.floor(totalSeconds),
  )

  const hours = Math.floor(
    safeTotalSeconds / 3600,
  )

  const minutes = Math.floor(
    (safeTotalSeconds % 3600) / 60,
  )

  const seconds = safeTotalSeconds % 60

  return [hours, minutes, seconds]
    .map((value) =>
      String(value).padStart(2, '0'),
    )
    .join(':')
}