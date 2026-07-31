import {
  useEffect,
  useState,
} from 'react'
import type { InstallAppResult } from '../hooks/usePwaExperience'
import './PwaStatus.css'

type PwaStatusProps = {
  isOnline: boolean
  canInstall: boolean
  isUpdateAvailable: boolean
  onInstall: () => Promise<InstallAppResult>
  onReloadForUpdate: () => void
}

function getInstallStatusMessage(
  result: InstallAppResult,
): string {
  switch (result) {
    case 'accepted':
      return 'アプリのインストールを開始しました。'

    case 'dismissed':
      return 'インストールはキャンセルされました。'

    case 'unavailable':
      return 'この環境ではインストールを開始できません。'

    case 'error':
      return 'アプリをインストールできませんでした。'
  }
}

function PwaStatus({
  isOnline,
  canInstall,
  isUpdateAvailable,
  onInstall,
  onReloadForUpdate,
}: PwaStatusProps) {
  const [isInstalling, setIsInstalling] =
    useState(false)

  const [
    isInstallDismissed,
    setIsInstallDismissed,
  ] = useState(false)

  const [statusMessage, setStatusMessage] =
    useState('')

  useEffect(() => {
    if (statusMessage === '') {
      return
    }

    const timeoutId = window.setTimeout(() => {
      setStatusMessage('')
    }, 4000)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [statusMessage])

  async function handleInstall() {
    if (isInstalling) {
      return
    }

    setIsInstalling(true)

    const result = await onInstall()

    setStatusMessage(
      getInstallStatusMessage(result),
    )

    setIsInstalling(false)
  }

  const shouldShowInstall =
    canInstall && !isInstallDismissed

  const hasVisibleNotice =
    !isOnline ||
    shouldShowInstall ||
    isUpdateAvailable ||
    statusMessage !== ''

  if (!hasVisibleNotice) {
    return null
  }

  return (
    <aside
      className="pwa-status-stack"
      aria-label="アプリの状態"
    >
      {!isOnline && (
        <div
          className="pwa-notice offline"
          role="status"
        >
          <span
            className="pwa-notice-dot"
            aria-hidden="true"
          />

          <div>
            <strong>オフラインです</strong>
            <p>
              保存済みの機能はそのまま利用できます。
            </p>
          </div>
        </div>
      )}

      {isUpdateAvailable && (
        <div
          className="pwa-notice update"
          role="status"
        >
          <div>
            <strong>
              新しいバージョンがあります
            </strong>
            <p>
              再読み込みすると更新されます。
            </p>
          </div>

          <button
            type="button"
            onClick={onReloadForUpdate}
          >
            更新する
          </button>
        </div>
      )}

      {shouldShowInstall && (
        <div
          className="pwa-notice install"
          role="status"
        >
          <div>
            <strong>
              アプリとして利用できます
            </strong>
            <p>
              インストールすると素早く起動できます。
            </p>
          </div>

          <div className="pwa-notice-actions">
            <button
              type="button"
              onClick={() => void handleInstall()}
              disabled={isInstalling}
            >
              {isInstalling
                ? '確認中…'
                : 'インストール'}
            </button>

            <button
              className="pwa-dismiss-button"
              type="button"
              onClick={() =>
                setIsInstallDismissed(true)
              }
              disabled={isInstalling}
            >
              後で
            </button>
          </div>
        </div>
      )}

      {statusMessage !== '' && (
        <div
          className="pwa-result-message"
          role="status"
          aria-live="polite"
        >
          {statusMessage}
        </div>
      )}
    </aside>
  )
}

export default PwaStatus