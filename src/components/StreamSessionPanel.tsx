import StreamNotificationSettings from './stream-session/StreamNotificationSettings'
import StreamInfoForm from './stream-session/StreamInfoForm'
import StreamStatusControl from './stream-session/StreamStatusControl'
import { useEffect, useRef, useState } from 'react';
import {
  type NotificationMinute,
  type StreamSession,
} from '../types/streamSession'
import { calculateCountdown } from '../utils/countdown'
import {
  getNotificationPermission,
  requestNotificationPermission,
  showBrowserNotification,
  type NotificationPermissionState,
} from '../utils/notifications';
import {
  getStreamUrlError,
  hasScheduledTimePassed,
} from '../utils/streamSessionValidation'

type StreamSessionPanelProps = {
  session: StreamSession;
  onChange: (session: StreamSession) => void;
  onReset: () => void;
};

function StreamSessionPanel({
  session,
  onChange,
  onReset,
}: StreamSessionPanelProps) {
    const [currentTime, setCurrentTime] = useState(() => Date.now());

    const [notificationPermission, setNotificationPermission] =
        useState<NotificationPermissionState>(() =>
            getNotificationPermission(),
        );

    const pendingNotificationMinutes =
      useRef<Set<NotificationMinute>>(new Set());

    useEffect(() => {
    if (!session.scheduledAt) {
        return undefined;
    }

    const intervalId = window.setInterval(() => {
        setCurrentTime(Date.now());
    }, 1000);

    return () => {
        window.clearInterval(intervalId);
    };
    }, [session.scheduledAt]);

    const countdown = calculateCountdown(
      session.scheduledAt,
      currentTime,
    );

    const streamUrlError = getStreamUrlError(
      session.streamUrl,
    );

    const scheduledTimePassed = hasScheduledTimePassed(
      session.scheduledAt,
      currentTime,
    );

    useEffect(() => {
      if (
        notificationPermission !== 'granted' ||
        !session.notificationsEnabled ||
        !countdown ||
        countdown.hasStarted
      ) {
        return;
      }

      const dueMinutes = session.notificationMinutes
        .filter((minute) => {
          const thresholdMilliseconds = minute * 60 * 1000;

          return (
            countdown.totalMilliseconds <= thresholdMilliseconds &&
            !session.notifiedMinutes.includes(minute) &&
            !pendingNotificationMinutes.current.has(minute)
          );
        })
        .sort((first, second) => first - second);

      if (dueMinutes.length === 0) {
        return;
      }

      const notificationMinute = dueMinutes[0];

      dueMinutes.forEach((minute) => {
        pendingNotificationMinutes.current.add(minute);
      });

      const nextNotifiedMinutes = Array.from(
        new Set([
          ...session.notifiedMinutes,
          ...dueMinutes,
        ]),
      ).sort((first, second) => second - first);

      onChange({
        ...session,
        notifiedMinutes: nextNotifiedMinutes,
      });

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
          pendingNotificationMinutes.current.delete(minute);
        });
      });
    }, [
      countdown,
      notificationPermission,
      onChange,
      session,
    ]);

  const updateField = <Key extends keyof StreamSession>(
    key: Key,
    value: StreamSession[Key],
  ) => {
    onChange({
      ...session,
      [key]: value,
    });
  };

  const handleNotificationPermission = async () => {
    const permission = await requestNotificationPermission();

    setNotificationPermission(permission);

    updateField(
        'notificationsEnabled',
        permission === 'granted',
    );
  };

  const handleTestNotification = async () => {
    const wasShown = await showBrowserNotification(
      '配信準備BOX',
      {
        body: '通知は正常に動作しています。',
        tag: 'haishin-box-notification-test',
      },
    );

    if (!wasShown) {
      window.alert(
        '通知を表示できませんでした。ブラウザ設定を確認してください。',
      );
    }
  };


  const toggleNotificationMinute = (
    minute: NotificationMinute,
  ) => {
    const isSelected =
      session.notificationMinutes.includes(minute);

    const nextMinutes = isSelected ? session.notificationMinutes.filter(
      (selectedMinute) => selectedMinute !== minute,
    )
    : [...session.notificationMinutes, minute].sort(
        (first, second) => second - first,
      );

      updateField('notificationMinutes', nextMinutes);
  };

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
        onScheduledAtChange={(scheduledAt) => {
          setCurrentTime(Date.now())
          pendingNotificationMinutes.current.clear()

          onChange({
            ...session,
            scheduledAt,
            notifiedMinutes: [],
          })
        }}
      />

      <StreamNotificationSettings
        permission={notificationPermission}
        notificationsEnabled={session.notificationsEnabled}
        notificationMinutes={session.notificationMinutes}
        onRequestPermission={handleNotificationPermission}
        onTestNotification={handleTestNotification}
        onEnabledChange={(enabled) =>
          updateField('notificationsEnabled', enabled)
        }
        onMinuteToggle={toggleNotificationMinute}
      />

      <StreamStatusControl
        status={session.status}
        scheduledTimePassed={scheduledTimePassed}
        onChange={(status) => updateField('status', status)}
      />

      <button
        type="button"
        className="stream-session-reset-button"
        onClick={onReset}
      >
        入力内容をリセット
      </button>
    </section>
  );
}

export default StreamSessionPanel;