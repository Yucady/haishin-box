import {
  useEffect,
  useRef,
  useState,
} from 'react'
import { STORAGE_KEYS } from '../constants/storageKeys'

const MEMO_MAX_LENGTH = 1000
const DEFAULT_MEMO_HEIGHT = 150
const MIN_MEMO_HEIGHT = 150
const MAX_MEMO_HEIGHT = 700

function loadMemo(): string {
  return localStorage.getItem(STORAGE_KEYS.memo) ?? ''
}

function loadMemoHeight(): number {
  const savedHeight = localStorage.getItem(
    STORAGE_KEYS.memoHeight,
  )

  if (savedHeight === null) {
    return DEFAULT_MEMO_HEIGHT
  }

  const parsedHeight = Number(savedHeight)

  if (!Number.isFinite(parsedHeight)) {
    return DEFAULT_MEMO_HEIGHT
  }

  return Math.min(
    Math.max(parsedHeight, MIN_MEMO_HEIGHT),
    MAX_MEMO_HEIGHT,
  )
}

function MemoPanel() {
    const [memo, setMemo] = useState(loadMemo)

    const [initialMemoHeight] = useState(loadMemoHeight)

    const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.memo, memo)
    } catch (error) {
      console.error('メモを保存できませんでした。', error)
    }
  }, [memo])

  useEffect(() => {
    const textarea = textareaRef.current

    if (textarea === null) {
        return
    }

    const resizeObserver = new ResizeObserver(() => {
        const currentHeight = Math.round(
        textarea.getBoundingClientRect().height,
        )

        const limitedHeight = Math.min(
        Math.max(currentHeight, MIN_MEMO_HEIGHT),
        MAX_MEMO_HEIGHT,
        )

        try {
        localStorage.setItem(
            STORAGE_KEYS.memoHeight,
            String(limitedHeight),
        )
        } catch (error) {
        console.error(
            'メモ欄の高さを保存できませんでした。',
            error,
        )
        }
    })

    resizeObserver.observe(textarea)

    return () => {
        resizeObserver.disconnect()
    }
    }, [])

  function clearMemo() {
    const shouldClear = window.confirm(
      'メモの内容をすべて削除しますか？',
    )

    if (!shouldClear) {
      return
    }

    setMemo('')
  }

  return (
    <article className="panel memo-panel">
      <div className="memo-header">
        <div>
          <h2>今日のメモ</h2>
          <p>入力内容はこのブラウザに自動保存されます。</p>
        </div>

        <span className="memo-count">
          {memo.length} / {MEMO_MAX_LENGTH}
        </span>
      </div>

      <textarea
        ref={textareaRef}
        value={memo}
        onChange={(event) => setMemo(event.target.value)}
        placeholder="配信で確認したいことを入力してください。"
        maxLength={MEMO_MAX_LENGTH}
        aria-label="今日のメモ"
        style={{ height: `${initialMemoHeight}px` }}
        />

      <div className="memo-footer">
        <span>自動保存</span>

        <button
          className="delete-button"
          type="button"
          onClick={clearMemo}
          disabled={memo === ''}
        >
          メモを消去
        </button>
      </div>
    </article>
  )
}

export default MemoPanel