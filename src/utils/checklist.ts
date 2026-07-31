import type { ChecklistItem } from '../types/checklist'

export function createDefaultChecklist(): ChecklistItem[] {
  return [
    {
      id: 'microphone',
      text: 'マイク確認',
      completed: false,
    },
    {
      id: 'obs',
      text: 'OBS起動',
      completed: false,
    },
    {
      id: 'title',
      text: '配信タイトル確認',
      completed: false,
    },
    {
      id: 'comments',
      text: 'コメント欄確認',
      completed: false,
    },
  ]
}

export function isChecklistItem(
  value: unknown,
): value is ChecklistItem {
  if (
    typeof value !== 'object' ||
    value === null ||
    Array.isArray(value)
  ) {
    return false
  }

  const candidate = value as Record<string, unknown>

  return (
    typeof candidate.id === 'string' &&
    candidate.id.trim() !== '' &&
    typeof candidate.text === 'string' &&
    candidate.text.trim() !== '' &&
    typeof candidate.completed === 'boolean'
  )
}

export function parseChecklist(
  value: string | null,
): ChecklistItem[] {
  if (value === null) {
    return createDefaultChecklist()
  }

  try {
    const parsedValue: unknown = JSON.parse(value)

    if (!Array.isArray(parsedValue)) {
      return createDefaultChecklist()
    }

    const usedIds = new Set<string>()

    const validItems = parsedValue
        .filter(isChecklistItem)
        .map((item) => ({
            ...item,
            id: item.id.trim(),
            text: item.text.trim(),
        }))
        .filter((item) => {
            if (usedIds.has(item.id)) {
            return false
            }

            usedIds.add(item.id)
            return true
        })

    if (
      parsedValue.length > 0 &&
      validItems.length === 0
    ) {
      return createDefaultChecklist()
    }

    return validItems
  } catch {
    return createDefaultChecklist()
  }
}

export function getIncompleteChecklistItems(
  checklist: readonly ChecklistItem[],
): ChecklistItem[] {
  return checklist.filter((item) => !item.completed)
}