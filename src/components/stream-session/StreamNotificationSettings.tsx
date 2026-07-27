import {
  NOTIFICATION_MINUTE_OPTIONS,
  type NotificationMinute,
} from '../../types/streamSession'
import type { NotificationPermissionState } from '../../utils/notifications'

type StreamNotificationSettingsProps = {
  permission: NotificationPermissionState
  notificationsEnabled: boolean
  notificationMinutes: readonly NotificationMinute[]
  onRequestPermission: () => Promise<void>
  onTestNotification: () => Promise<void>
  onEnabledChange: (enabled: boolean) => void
  onMinuteToggle: (minute: NotificationMinute) => void
}

const PERMISSION_LABELS: Record<
  NotificationPermissionState,
  string
> = {
  default: '通知を許可する',
  granted: '通知は許可されています',
  denied: '通知がブロックされています',
  unsupported: '通知は利用できません',
}

function StreamNotificationSettings({
  permission,
  notificationsEnabled,
  notificationMinutes,
  onRequestPermission,
  onTestNotification,
  onEnabledChange,
  onMinuteToggle,
}: StreamNotificationSettingsProps) {
  return (
    <div className="stream-notification-settings">
      <div className="stream-notification-header">
        <span className="stream-session-label">
          開始前通知
        </span>

        <div className="stream-notification-actions">
          <button
            type="button"
            className="notification-permission-button"
            disabled={permission !== 'default'}
            onClick={onRequestPermission}
          >
            {PERMISSION_LABELS[permission]}
          </button>

          {permission === 'granted' && (
            <button
              type="button"
              className="notification-test-button"
              onClick={onTestNotification}
            >
              テスト通知
            </button>
          )}
        </div>
      </div>

      {permission === 'granted' && (
        <>
          <label className="notification-enabled-toggle">
            <input
              type="checkbox"
              checked={notificationsEnabled}
              onChange={(event) =>
                onEnabledChange(event.target.checked)
              }
            />

            <span>通知を有効にする</span>
          </label>

          <div
            className="notification-minute-options"
            role="group"
            aria-label="通知時間"
          >
            {NOTIFICATION_MINUTE_OPTIONS.map((minute) => (
              <label
                key={minute}
                className="notification-minute-option"
              >
                <input
                  type="checkbox"
                  checked={notificationMinutes.includes(
                    minute,
                  )}
                  disabled={!notificationsEnabled}
                  onChange={() => onMinuteToggle(minute)}
                />

                <span>{minute}分前</span>
              </label>
            ))}
          </div>
        </>
      )}

      {permission === 'denied' && (
        <p className="notification-message">
          ブラウザのサイト設定から通知を許可してください。
        </p>
      )}

      {permission === 'unsupported' && (
        <p className="notification-message">
          このブラウザでは通知を利用できません。
        </p>
      )}
    </div>
  )
}

export default StreamNotificationSettings