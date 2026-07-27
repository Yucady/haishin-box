import { useEffect, useState } from 'react'

import useStreamNotifications from '../hooks/useStreamNotifications'
import type { StreamSession } from '../types/streamSession'
import { calculateCountdown } from '../utils/countdown'
import {
  getStreamUrlError,
  hasScheduledTimePassed,
} from '../utils/streamSessionValidation'
import StreamInfoForm from './stream-session/StreamInfoForm'
import StreamNotificationSettings from './stream-session/StreamNotificationSettings'
import StreamStatusControl from './stream-session/StreamStatusControl'

type StreamSessionPanelProps = {
  session: StreamSession
  onChange: (session: StreamSession) => void
  onReset: () => void
}

function StreamSessionPanel({
  session,
  onChange,
  onReset,
}: StreamSessionPanelProps) {
  const [currentTime, setCurrentTime] = useState(
    () => Date.now(),
  )

  useEffect(() => {
    if (!session.scheduledAt) {
      return
    }

    const intervalId = window.setInterval(() => {
      setCurrentTime(Date.now())
    }, 1000)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [session.scheduledAt])

  const countdown = calculateCountdown(
    session.scheduledAt,
    currentTime,
  )

  const streamUrlError = getStreamUrlError(
    session.streamUrl,
  )

  const scheduledTimePassed = hasScheduledTimePassed(
    session.scheduledAt,
    currentTime,
  )

  const {
    permission: notificationPermission,
    requestPermission: handleNotificationPermission,
    showTestNotification: handleTestNotification,
    toggleMinute: toggleNotificationMinute,
    clearPendingNotifications,
  } = useStreamNotifications({
    session,
    countdown,
    onChange,
  })

  function updateField<Key extends keyof StreamSession>(
    key: Key,
    value: StreamSession[Key],
  ) {
    onChange({
      ...session,
      [key]: value,
    })
  }

  function handleScheduledAtChange(
    scheduledAt: string,
  ) {
    setCurrentTime(Date.now())
    clearPendingNotifications()

    onChange({
      ...session,
      scheduledAt,
      notifiedMinutes: [],
    })
  }

  function handleReset() {
    clearPendingNotifications()
    onReset()
  }

  return (
    <section
      className="panel stream-session-panel"
      aria-labelledby="stream-session-title"
    >
      <h2 id="stream-session-title">今日の配信</h2>

      <StreamInfoForm
        session={session}
        countdown={countdown}
        streamUrlError={streamUrlError}
        onFieldChange={updateField}
        onScheduledAtChange={handleScheduledAtChange}
      />

      <StreamStatusControl
        status={session.status}
        scheduledTimePassed={scheduledTimePassed}
        onChange={(status) =>
          updateField('status', status)
        }
      />

      <StreamNotificationSettings
        permission={notificationPermission}
        notificationsEnabled={
          session.notificationsEnabled
        }
        notificationMinutes={
          session.notificationMinutes
        }
        onRequestPermission={
          handleNotificationPermission
        }
        onTestNotification={handleTestNotification}
        onEnabledChange={(enabled) =>
          updateField('notificationsEnabled', enabled)
        }
        onMinuteToggle={toggleNotificationMinute}
      />

      <button
        type="button"
        className="stream-session-reset-button"
        onClick={handleReset}
      >
        入力内容をリセット
      </button>
    </section>
  )
}

export default StreamSessionPanel