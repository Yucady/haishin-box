import { useEffect, useState } from 'react'
import twitterText from 'twitter-text'

import { STORAGE_KEYS } from '../constants/storageKeys'
import { openXPostComposer } from '../utils/xIntent'

type StatusMessage = {
  type: 'success' | 'error'
  text: string
}

function loadXPostDraft() {
  try {
    return (
      localStorage.getItem(STORAGE_KEYS.xPostDraft) ??
      ''
    )
  } catch (error) {
    console.error(
      'Xの投稿下書きを読み込めませんでした。',
      error,
    )

    return ''
  }
}

function XPostPanel() {
  const [postText, setPostText] = useState(
    loadXPostDraft,
  )

  const [statusMessage, setStatusMessage] =
    useState<StatusMessage | null>(null)

  const postResult =
    twitterText.parseTweet(postText)

  const isEmpty = postText.trim() === ''

  const isOverLimit =
    !isEmpty && !postResult.valid

  const canOpenX = !isEmpty && postResult.valid

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEYS.xPostDraft,
        postText,
      )
    } catch (error) {
      console.error(
        'Xの投稿下書きを保存できませんでした。',
        error,
      )
    }
  }, [postText])

  async function copyPostText() {
    if (isEmpty) {
      return
    }

    try {
      await navigator.clipboard.writeText(postText)

      setStatusMessage({
        type: 'success',
        text: '投稿内容をコピーしました。',
      })
    } catch (error) {
      console.error(
        '投稿内容をコピーできませんでした。',
        error,
      )

      setStatusMessage({
        type: 'error',
        text: 'コピーできませんでした。',
      })
    }
  }

  function clearPostText() {
    if (isEmpty) {
      return
    }

    const shouldClear = window.confirm(
      'Xの投稿下書きを削除しますか？',
    )

    if (!shouldClear) {
      return
    }

    setPostText('')

    setStatusMessage({
      type: 'success',
      text: '投稿下書きを削除しました。',
    })
  }

  function openPostComposer() {
    if (!canOpenX) {
      return
    }

    const didOpen = openXPostComposer(postText)

    if (!didOpen) {
      setStatusMessage({
        type: 'error',
        text: 'ポップアップがブロックされました。ブラウザの設定を確認してください。',
      })

      return
    }

    setStatusMessage({
      type: 'success',
      text: 'Xの投稿画面を開きました。投稿前に内容を確認してください。',
    })
  }

  return (
    <article className="panel x-post-panel">
      <div className="x-post-header">
        <div>
          <h2>X告知作成</h2>

          <p>
            入力内容はこの端末に自動保存されます。
          </p>
        </div>
      </div>

      <textarea
        className="x-post-textarea"
        value={postText}
        onChange={(event) => {
          setPostText(event.target.value)
          setStatusMessage(null)
        }}
        placeholder="Xに投稿するお知らせを書いてください。"
        aria-label="Xに投稿するお知らせ"
      />

      <div className="x-post-footer">
        <span
          className={
            isOverLimit
              ? 'x-post-count over-limit'
              : 'x-post-count'
          }
          aria-live="polite"
        >
          {postResult.weightedLength} / 280
        </span>
      </div>

      <div className="x-post-actions">
        <button
          className="secondary-button"
          type="button"
          onClick={copyPostText}
          disabled={isEmpty}
        >
          コピー
        </button>

        <button
          className="danger-button"
          type="button"
          onClick={clearPostText}
          disabled={isEmpty}
        >
          下書きを削除
        </button>

        <button
          className="x-open-button"
          type="button"
          onClick={openPostComposer}
          disabled={!canOpenX}
        >
          Xで投稿画面を開く
        </button>
      </div>

      {statusMessage !== null && (
        <div
          className={`x-post-status ${statusMessage.type}`}
          role="status"
          aria-live="polite"
        >
          {statusMessage.text}
        </div>
      )}
    </article>
  )
}

export default XPostPanel