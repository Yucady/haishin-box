import {
  useState,
  type FormEvent,
} from 'react'

import useStreamPresets from '../../hooks/useStreamPresets'
import type { StreamPreset } from '../../types/streamPreset'
import type { StreamSession } from '../../types/streamSession'

type StreamPresetManagerProps = {
  session: StreamSession
  onApply: (preset: StreamPreset) => void
}

function StreamPresetManager({
  session,
  onApply,
}: StreamPresetManagerProps) {
  const {
    presets,
    storageError,
    addPreset,
    deletePreset,
  } = useStreamPresets()

  const [presetName, setPresetName] = useState('')
  const [formError, setFormError] = useState('')

  function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    const trimmedName = presetName.trim()

    if (trimmedName === '') {
      setFormError(
        'プリセット名を入力してください。',
      )
      return
    }

    const hasDuplicateName = presets.some(
      (preset) => preset.name === trimmedName,
    )

    if (hasDuplicateName) {
      setFormError(
        '同じ名前のプリセットが既にあります。',
      )
      return
    }

    addPreset(trimmedName, session)
    setPresetName('')
    setFormError('')
  }

  function handleApply(preset: StreamPreset) {
    const shouldApply = window.confirm(
      `「${preset.name}」を現在の配信情報に適用しますか？開始予定は変更されません。`,
    )

    if (shouldApply) {
      onApply(preset)
    }
  }

  function handleDelete(preset: StreamPreset) {
    const shouldDelete = window.confirm(
      `「${preset.name}」を削除しますか？`,
    )

    if (shouldDelete) {
      deletePreset(preset.id)
    }
  }

  function getNotificationSummary(
    preset: StreamPreset,
  ) {
    if (
      !preset.notificationsEnabled ||
      preset.notificationMinutes.length === 0
    ) {
      return '通知なし'
    }

    const minutes = preset.notificationMinutes
      .map((minute) => `${minute}分前`)
      .join('・')

    return `通知：${minutes}`
  }

  return (
    <section
      className="stream-preset-manager"
      aria-labelledby="stream-preset-title"
    >
      <div className="stream-preset-header">
        <div>
          <h3 id="stream-preset-title">
            配信プリセット
          </h3>

          <p>
            現在のタイトル・URL・ハッシュタグ・通知設定を
            保存します。開始予定は保存されません。
          </p>
        </div>
      </div>

      <form
        className="stream-preset-form"
        onSubmit={handleSubmit}
      >
        <input
          type="text"
          value={presetName}
          maxLength={30}
          placeholder="プリセット名（例：毎週の雑談）"
          aria-label="プリセット名"
          aria-invalid={formError !== ''}
          onChange={(event) => {
            setPresetName(event.target.value)
            setFormError('')
          }}
        />

        <button
          type="submit"
          disabled={presetName.trim() === ''}
        >
          現在の内容を保存
        </button>
      </form>

      {formError !== '' && (
        <p
          className="stream-preset-error"
          role="alert"
        >
          {formError}
        </p>
      )}

      {storageError !== '' && (
        <p
          className="stream-preset-error"
          role="alert"
        >
          {storageError}
        </p>
      )}

      {presets.length === 0 ? (
        <p className="stream-preset-empty">
          保存されているプリセットはありません。
        </p>
      ) : (
        <div className="stream-preset-list">
          {presets.map((preset) => (
            <article
              className="stream-preset-card"
              key={preset.id}
            >
              <div className="stream-preset-card-header">
                <strong>{preset.name}</strong>

                <button
                  type="button"
                  className="delete-button"
                  onClick={() =>
                    handleDelete(preset)
                  }
                >
                  削除
                </button>
              </div>

              <p className="stream-preset-title-summary">
                {preset.title || 'タイトル未設定'}
              </p>

              <div className="stream-preset-meta">
                {preset.streamUrl !== '' && (
                  <span>URLあり</span>
                )}

                {preset.hashtags !== '' && (
                  <span>{preset.hashtags}</span>
                )}

                <span>
                  {getNotificationSummary(preset)}
                </span>
              </div>

              <button
                type="button"
                className="stream-preset-apply-button"
                onClick={() => handleApply(preset)}
              >
                このプリセットを適用
              </button>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

export default StreamPresetManager