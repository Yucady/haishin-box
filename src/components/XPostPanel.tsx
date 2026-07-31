import { useState } from 'react'
import twitterText from 'twitter-text'
import type { StreamSession } from '../types/streamSession'
import { createStreamAnnouncement } from '../utils/templateVariables'
import { getStreamUrlError } from '../utils/streamSessionValidation'
import { openXPostComposer } from '../utils/xIntent'

type StatusMessage = {
  type: 'success' | 'error'
  text: string
}
type XPostPanelProps = {
  streamSession: StreamSession
  postText: string
  onPostTextChange: (text: string) => void
}

function XPostPanel({
  streamSession,
  postText,
  onPostTextChange,
}: XPostPanelProps) {

  const [statusMessage, setStatusMessage] =
    useState<StatusMessage | null>(null)

  const postResult =
    twitterText.parseTweet(postText)

  const isEmpty = postText.trim() === ''

  const isOverLimit =
    !isEmpty && !postResult.valid

  const canOpenX = !isEmpty && postResult.valid

  function createPostFromStreamSession() {
    const hasStreamInformation = [
      streamSession.title,
      streamSession.scheduledAt,
      streamSession.streamUrl,
      streamSession.hashtags,
    ].some((value) => value.trim() !== '')

    if (!hasStreamInformation) {
      setStatusMessage({
        type: 'error',
        text: '先に「今日の配信」を入力してください。',
      })
      return
    }

    const streamUrlError = getStreamUrlError(
      streamSession.streamUrl,
    )

    if (streamUrlError) {
      setStatusMessage({
        type: 'error',
        text: streamUrlError,
      })
      return
    }

    const generatedText =
      createStreamAnnouncement(streamSession)

    if (!isEmpty && postText !== generatedText) {
      const shouldReplace = window.confirm(
        '現在のX投稿下書きを、今日の配信情報で置き換えますか？',
      )

      if (!shouldReplace) {
        return
      }
    }

    onPostTextChange(generatedText)

    setStatusMessage({
      type: 'success',
      text: '今日の配信情報から投稿下書きを作成しました。',
    })
  }

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

    onPostTextChange('')

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

        <button
          className="x-post-generate-button"
          type="button"
          onClick={createPostFromStreamSession}
        >
          配信情報から作成
        </button>
      </div>

      <textarea
        className="x-post-textarea"
        value={postText}
        onChange={(event) => {
          onPostTextChange(event.target.value)
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