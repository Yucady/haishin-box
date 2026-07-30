import { useState } from 'react'

import { STORAGE_KEYS } from '../constants/storageKeys'
import type { StreamPreset } from '../types/streamPreset'
import type { StreamSession } from '../types/streamSession'
import {
  createStreamPreset,
  parseStreamPresets,
} from '../utils/streamPresets'

function loadStreamPresets(): StreamPreset[] {
  try {
    return parseStreamPresets(
      localStorage.getItem(STORAGE_KEYS.streamPresets),
    )
  } catch (error) {
    console.error(
      '配信プリセットを読み込めませんでした。',
      error,
    )

    return []
  }
}

function useStreamPresets() {
  const [presets, setPresets] =
    useState<StreamPreset[]>(loadStreamPresets)

  const [storageError, setStorageError] = useState('')

  function savePresets(
    nextPresets: StreamPreset[],
  ) {
    try {
      localStorage.setItem(
        STORAGE_KEYS.streamPresets,
        JSON.stringify(nextPresets),
      )

      setStorageError('')
    } catch (error) {
      console.error(
        '配信プリセットを保存できませんでした。',
        error,
      )

      setStorageError(
        'プリセットを端末に保存できませんでした。',
      )
    }
  }

  function addPreset(
    name: string,
    session: StreamSession,
  ) {
    const preset = createStreamPreset(
      crypto.randomUUID(),
      name,
      session,
    )

    const nextPresets = [...presets, preset]

    setPresets(nextPresets)
    savePresets(nextPresets)
  }

  function deletePreset(id: string) {
    const nextPresets = presets.filter(
      (preset) => preset.id !== id,
    )

    setPresets(nextPresets)
    savePresets(nextPresets)
  }

  return {
    presets,
    storageError,
    addPreset,
    deletePreset,
  }
}

export default useStreamPresets