import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import { STORAGE_KEYS } from '../constants/storageKeys'
import type { ChecklistItem } from '../types/checklist'
import {
  getIncompleteChecklistItems,
  parseChecklist,
} from '../utils/checklist'

function loadChecklist(): ChecklistItem[] {
  try {
    return parseChecklist(
      localStorage.getItem(STORAGE_KEYS.checklist),
    )
  } catch (error) {
    console.error(
      'チェックリストを読み込めませんでした。',
      error,
    )

    return parseChecklist(null)
  }
}

function useChecklist() {
  const [checklist, setChecklist] =
    useState<ChecklistItem[]>(loadChecklist)

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEYS.checklist,
        JSON.stringify(checklist),
      )
    } catch (error) {
      console.error(
        'チェックリストを保存できませんでした。',
        error,
      )
    }
  }, [checklist])

  const incompleteChecklistItems = useMemo(
    () => getIncompleteChecklistItems(checklist),
    [checklist],
  )

  function addChecklistItem(text: string): boolean {
    const trimmedText = text.trim()

    if (trimmedText === '') {
      return false
    }

    const newItem: ChecklistItem = {
      id: crypto.randomUUID(),
      text: trimmedText,
      completed: false,
    }

    setChecklist((currentChecklist) => [
      ...currentChecklist,
      newItem,
    ])

    return true
  }

  function toggleChecklistItem(id: string) {
    setChecklist((currentChecklist) =>
      currentChecklist.map((item) =>
        item.id === id
          ? {
              ...item,
              completed: !item.completed,
            }
          : item,
      ),
    )
  }

  function resetChecklist() {
    setChecklist((currentChecklist) =>
      currentChecklist.map((item) => ({
        ...item,
        completed: false,
      })),
    )
  }

  function deleteChecklistItem(id: string) {
    setChecklist((currentChecklist) =>
      currentChecklist.filter(
        (item) => item.id !== id,
      ),
    )
  }

  return {
    checklist,
    incompleteChecklistItems,
    addChecklistItem,
    toggleChecklistItem,
    resetChecklist,
    deleteChecklistItem,
  }
}

export default useChecklist