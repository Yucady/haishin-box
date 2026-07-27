import { useEffect, useRef, useState } from 'react'

import type {
  NotificationMinute,
  StreamSession,
} from '../types/streamSession'
import type { calculateCountdown } from '../utils/countdown'
import {
  getNotificationPermission,
  requestNotificationPermission,
  showBrowserNotification,
  type NotificationPermissionState,
} from '../utils/notifications'

type Countdown = ReturnType<typeof calculateCountdown>

type UseStreamNotificationsOptions = {
  session: StreamSession
  countdown: Countdown
  onChange: (session: StreamSession) => void
}

function useStreamNotifications({
  session,
  countdown,
  onChange,
}: UseStreamNotificationsOptions) {
  const [permission, setPermission] =
    useState<NotificationPermissionState>(() =>
      getNotificationPermission(),
    )

  const pendingMinutes =
    useRef<Set<NotificationMinute>>(new Set())

  useEffect(() => {
    if (
      permission !== 'granted' ||
      !session.notificationsEnabled ||
      !countdown ||
      countdown.hasStarted
    ) {
      return
    }

    const dueMinutes = session.notificationMinutes
      .filter((minute) => {
        const thresholdMilliseconds =
          minute * 60 * 1000

        return (
          countdown.totalMilliseconds <=
            thresholdMilliseconds &&
          !session.notifiedMinutes.includes(minute) &&
          !pendingMinutes.current.has(minute)
        )
      })
      .sort((first, second) => first - second)

    if (dueMinutes.length === 0) {
      return
    }

    const notificationMinute = dueMinutes[0]

    dueMinutes.forEach((minute) => {
      pendingMinutes.current.add(minute)
    })

    const nextNotifiedMinutes = Array.from(
      new Set([
        ...session.notifiedMinutes,
        ...dueMinutes,
      ]),
    ).sort((first, second) => second - first)

    onChange({
      ...session,
      notifiedMinutes: nextNotifiedMinutes,
    })

    void showBrowserNotification(
      session.title.trim()
        ? `「${session.title.trim()}」配信のお知らせ`
        : '配信開始のお知らせ',
      {
        body: `配信開始まであと${notificationMinute}分です。準備を確認しましょう。`,
        tag: `haishin-box-stream-${session.scheduledAt}-${notificationMinute}`,
      },
    ).finally(() => {
      dueMinutes.forEach((minute) => {
        pendingMinutes.current.delete(minute)
      })
    })
  }, [countdown, onChange, permission, session])

  async function requestPermission() {
    const nextPermission =
      await requestNotificationPermission()

    setPermission(nextPermission)

    onChange({
      ...session,
      notificationsEnabled:
        nextPermission === 'granted',
    })
  }

  async function showTestNotification() {
    const wasShown = await showBrowserNotification(
      '配信準備BOX',
      {
        body: '通知は正常に動作しています。',
        tag: 'haishin-box-notification-test',
      },
    )

    if (!wasShown) {
      window.alert(
        '通知を表示できませんでした。ブラウザ設定を確認してください。',
      )
    }
  }

  function toggleMinute(minute: NotificationMinute) {
    const isSelected =
      session.notificationMinutes.includes(minute)

    const notificationMinutes = isSelected
      ? session.notificationMinutes.filter(
          (selectedMinute) =>
            selectedMinute !== minute,
        )
      : [...session.notificationMinutes, minute].sort(
          (first, second) => second - first,
        )

    onChange({
      ...session,
      notificationMinutes,
    })
  }

  function clearPendingNotifications() {
    pendingMinutes.current.clear()
  }

  return {
    permission,
    requestPermission,
    showTestNotification,
    toggleMinute,
    clearPendingNotifications,
  }
}

export default useStreamNotifications