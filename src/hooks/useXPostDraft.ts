import {
  useEffect,
  useState,
} from 'react'

import { STORAGE_KEYS } from '../constants/storageKeys'

function loadXPostDraft(): string {
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

function useXPostDraft() {
  const [xPostDraft, setXPostDraft] =
    useState(loadXPostDraft)

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEYS.xPostDraft,
        xPostDraft,
      )
    } catch (error) {
      console.error(
        'Xの投稿下書きを保存できませんでした。',
        error,
      )
    }
  }, [xPostDraft])

  return {
    xPostDraft,
    setXPostDraft,
  }
}

export default useXPostDraft