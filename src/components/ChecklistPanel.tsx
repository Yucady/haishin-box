import {
  useEffect,
  useState,
  type FormEvent,
} from 'react'
import { STORAGE_KEYS } from '../constants/storageKeys'

type ChecklistItem = {
  id: string
  text: string
  completed: boolean
}

const initialChecklist: ChecklistItem[] = [
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

function loadChecklist(): ChecklistItem[] {
  const savedChecklist = localStorage.getItem(
    STORAGE_KEYS.checklist,
  )

  if (savedChecklist === null) {
    return initialChecklist
  }

  try {
    const parsedChecklist = JSON.parse(savedChecklist)

    if (!Array.isArray(parsedChecklist)) {
      return initialChecklist
    }

    return parsedChecklist as ChecklistItem[]
  } catch {
    return initialChecklist
  }
}

function ChecklistPanel() {
  const [checklist, setChecklist] =
    useState<ChecklistItem[]>(loadChecklist)

  const [newItemText, setNewItemText] = useState('')

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

  function addChecklistItem(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    const trimmedText = newItemText.trim()

    if (trimmedText === '') {
      return
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

    setNewItemText('')
  }

  function toggleChecklist(id: string) {
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
      currentChecklist.filter((item) => item.id !== id),
    )
  }

  return (
    <article className="panel">
      <h2>配信準備</h2>

      <form
        className="checklist-form"
        onSubmit={addChecklistItem}
      >
        <input
          type="text"
          value={newItemText}
          onChange={(event) =>
            setNewItemText(event.target.value)
          }
          placeholder="準備項目を入力"
          maxLength={50}
          aria-label="新しい準備項目"
        />

        <button type="submit">追加</button>
      </form>

      {checklist.map((item) => (
        <div className="checklist-row" key={item.id}>
          <label
            className={item.completed ? 'completed' : ''}
          >
            <input
              type="checkbox"
              checked={item.completed}
              onChange={() => toggleChecklist(item.id)}
            />

            <span>{item.text}</span>
          </label>

          <button
            className="delete-button"
            type="button"
            onClick={() => deleteChecklistItem(item.id)}
            aria-label={`${item.text}を削除`}
          >
            削除
          </button>
        </div>
      ))}

      <button type="button" onClick={resetChecklist}>
        チェックをリセット
      </button>
    </article>
  )
}

export default ChecklistPanel