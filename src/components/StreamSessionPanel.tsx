import { useEffect, useRef, useState } from 'react';
import {
  NOTIFICATION_MINUTE_OPTIONS,
  type NotificationMinute,
  type StreamSession,
  type StreamStatus,
} from '../types/streamSession';
import {
  calculateCountdown,
  formatCountdown,
} from '../utils/countdown';
import {
  getNotificationPermission,
  requestNotificationPermission,
  showBrowserNotification,
  type NotificationPermissionState,
} from '../utils/notifications';
import {
  getStreamUrlError,
  hasScheduledTimePassed,
  normalizeHashtags,
} from '../utils/streamSessionValidation';

type StreamSessionPanelProps = {
  session: StreamSession;
  onChange: (session: StreamSession) => void;
  onReset: () => void;
};

const STATUS_OPTIONS: {
  value: StreamStatus;
  label: string;
}[] = [
  { value: 'preparing', label: '準備中' },
  { value: 'live', label: '配信中' },
  { value: 'ended', label: '終了' },
];

const NOTIFICATION_PERMISSION_LABELS: Record<
  NotificationPermissionState,
  string
> = {
  default: '通知を許可する',
  granted: '通知は許可されています',
  denied: '通知がブロックされています',
  unsupported: '通知は利用できません',
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

      <div className="stream-session-form">
        <label className="stream-session-field">
          <span>配信タイトル</span>
          <input
            type="text"
            value={session.title}
            placeholder="今日の配信タイトル"
            onChange={(event) => updateField('title', event.target.value)}
          />
        </label>

        <label className="stream-session-field">
          <span>開始予定</span>
          <input
            type="datetime-local"
            value={session.scheduledAt}
            onChange={(event) => {
              setCurrentTime(Date.now());
              pendingNotificationMinutes.current.clear();

              onChange({
                ...session,
                scheduledAt: event.target.value,
                notifiedMinutes: [],
              });
            }}
          />
        </label>

        {countdown && (
            <div
                className={
                countdown.hasStarted
                    ? 'stream-countdown started'
                    : 'stream-countdown'
                }
                role="timer"
            >
                <span>
                {countdown.hasStarted ? '配信開始' : '配信開始まで'}
                </span>

                <strong>{formatCountdown(countdown)}</strong>
            </div>
        )}

        <label className="stream-session-field">
          <span>配信URL</span>
          <input
            type="url"
            value={session.streamUrl}
            placeholder="https://..."
            aria-invalid={Boolean(streamUrlError)}
            aria-describedby={
              streamUrlError ? 'stream-url-error' : undefined
            }
            onChange={(event) =>
              updateField('streamUrl', event.target.value)
            }
          />
        </label>

        {streamUrlError && (
          <p
            id="stream-url-error"
            className="stream-field-error"
            role="alert"
          >
            {streamUrlError}
          </p>
        )}

        <label className="stream-session-field">
          <span>ハッシュタグ</span>
          <input
            type="text"
            value={session.hashtags}
            placeholder="#配信 #雑談"
            onChange={(event) =>
              updateField('hashtags', event.target.value)
            }
            onBlur={() =>
              updateField(
                'hashtags',
                normalizeHashtags(session.hashtags),
              )
            }
          />
        </label>
      </div>

      <div className="stream-status-field">
        <span className="stream-session-label">配信状態</span>

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
                session.status === option.value
                  ? 'stream-status-button active'
                  : 'stream-status-button'
              }
              aria-pressed={session.status === option.value}
              onClick={() => updateField('status', option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>

        {scheduledTimePassed &&
          session.status === 'preparing' && (
            <p className="stream-status-warning">
              開始予定時刻を過ぎています。配信状態を確認してください。
            </p>
          )}
      </div>

      <div className="stream-notification-settings">
        <div className="stream-notification-header">
            <span className="stream-session-label">開始前通知</span>

            <div className="stream-notification-actions">
              <button
                type="button"
                className="notification-permission-button"
                disabled={notificationPermission !== 'default'}
                onClick={handleNotificationPermission}
              >
                {NOTIFICATION_PERMISSION_LABELS[notificationPermission]}
              </button>

              {notificationPermission === 'granted' && (
                <button
                  type="button"
                  className="notification-test-button"
                  onClick={handleTestNotification}
                >
                  テスト通知
                </button>
              )}
            </div>
        </div>

        {notificationPermission === 'granted' && (
            <>
            <label className="notification-enabled-toggle">
                <input
                type="checkbox"
                checked={session.notificationsEnabled}
                onChange={(event) =>
                    updateField(
                    'notificationsEnabled',
                    event.target.checked,
                    )
                }
                />

                <span>通知を有効にする</span>
            </label>

            <div
                className="notification-minute-options"
                aria-label="通知時間"
            >
                {NOTIFICATION_MINUTE_OPTIONS.map((minute) => (
                <label
                    key={minute}
                    className="notification-minute-option"
                >
                    <input
                    type="checkbox"
                    checked={session.notificationMinutes.includes(
                        minute,
                    )}
                    disabled={!session.notificationsEnabled}
                    onChange={() =>
                        toggleNotificationMinute(minute)
                    }
                    />

                    <span>{minute}分前</span>
                </label>
                ))}
            </div>
            </>
        )}

        {notificationPermission === 'denied' && (
            <p className="notification-message">
            ブラウザのサイト設定から通知を許可してください。
            </p>
        )}

        {notificationPermission === 'unsupported' && (
            <p className="notification-message">
            このブラウザでは通知を利用できません。
            </p>
        )}
        </div>

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