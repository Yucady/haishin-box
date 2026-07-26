import {
  useRef,
  useState,
  type ChangeEvent,
} from 'react'

import { ALL_STORAGE_KEYS } from '../constants/storageKeys'

type BackupFile = {
  app: 'haishin-box'
  version: 1
  exportedAt: string
  data: Record<string, string | null>
}

function isBackupFile(value: unknown): value is BackupFile {
  if (
    typeof value !== 'object' ||
    value === null ||
    Array.isArray(value)
  ) {
    return false
  }

  const candidate = value as Record<string, unknown>

  if (
    candidate.app !== 'haishin-box' ||
    candidate.version !== 1 ||
    typeof candidate.exportedAt !== 'string'
  ) {
    return false
  }

  const data = candidate.data

  if (
    typeof data !== 'object' ||
    data === null ||
    Array.isArray(data)
  ) {
    return false
  }

  const dataRecord = data as Record<string, unknown>

  return ALL_STORAGE_KEYS.every((key) => {
    const storedValue = dataRecord[key]

    return (
      storedValue === null ||
      typeof storedValue === 'string'
    )
  })
}

function SettingsPanel() {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [statusMessage, setStatusMessage] = useState('')

  function exportBackup() {
    const data: Record<string, string | null> = {}

    ALL_STORAGE_KEYS.forEach((key) => {
      data[key] = localStorage.getItem(key)
    })

    const backupFile: BackupFile = {
      app: 'haishin-box',
      version: 1,
      exportedAt: new Date().toISOString(),
      data,
    }

    const backupJson = JSON.stringify(
      backupFile,
      null,
      2,
    )

    const backupBlob = new Blob([backupJson], {
      type: 'application/json',
    })

    const downloadUrl =
      URL.createObjectURL(backupBlob)

    const downloadLink =
      document.createElement('a')

    const currentDate = new Date()
      .toISOString()
      .slice(0, 10)

    downloadLink.href = downloadUrl
    downloadLink.download =
      `haishin-box-backup-${currentDate}.json`

    document.body.appendChild(downloadLink)
    downloadLink.click()
    downloadLink.remove()

    URL.revokeObjectURL(downloadUrl)

    setStatusMessage(
      'バックアップファイルを保存しました。',
    )
  }

  function openImportFilePicker() {
    fileInputRef.current?.click()
  }

  async function importBackup(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const selectedFile = event.target.files?.[0]

    event.target.value = ''

    if (selectedFile === undefined) {
      return
    }

    try {
      const fileText = await selectedFile.text()
      const parsedFile: unknown = JSON.parse(fileText)

      if (!isBackupFile(parsedFile)) {
        setStatusMessage(
          'このファイルは使用できないバックアップです。',
        )
        return
      }

      const shouldImport = window.confirm(
        '現在のデータをバックアップの内容で上書きしますか？',
      )

      if (!shouldImport) {
        return
      }

      ALL_STORAGE_KEYS.forEach((key) => {
        const storedValue = parsedFile.data[key]

        if (storedValue === null) {
          localStorage.removeItem(key)
        } else {
          localStorage.setItem(key, storedValue)
        }
      })

      setStatusMessage(
        'バックアップを復元しました。再読み込みします。',
      )

      window.setTimeout(() => {
        window.location.reload()
      }, 500)
    } catch (error) {
      console.error(
        'バックアップを読み込めませんでした。',
        error,
      )

      setStatusMessage(
        'バックアップファイルを読み込めませんでした。',
      )
    }
  }

  function resetAllData() {
    const shouldReset = window.confirm(
      '保存されているすべてのデータを削除しますか？この操作は元に戻せません。',
    )

    if (!shouldReset) {
      return
    }

    ALL_STORAGE_KEYS.forEach((key) => {
      localStorage.removeItem(key)
    })

    window.location.reload()
  }

  return (
    <article className="panel settings-panel">
      <div className="settings-header">
        <div>
          <h2>データ管理</h2>

          <div className="settings-description">
            登録内容をファイルに保存したり、別の端末で
            復元したりできます。
          </div>
        </div>
      </div>

      <div className="settings-actions">
        <button
          type="button"
          onClick={exportBackup}
        >
          バックアップを保存
        </button>

        <button
          className="secondary-button"
          type="button"
          onClick={openImportFilePicker}
        >
          バックアップを復元
        </button>

        <button
          className="danger-button"
          type="button"
          onClick={resetAllData}
        >
          すべて初期化
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        onChange={importBackup}
        hidden
      />

      {statusMessage !== '' && (
        <div
          className="settings-status"
          role="status"
          aria-live="polite"
        >
          {statusMessage}
        </div>
      )}
    </article>
  )
}

export default SettingsPanel