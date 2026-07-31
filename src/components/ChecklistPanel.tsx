import {
  useState,
  type FormEvent,
} from 'react'

import type { ChecklistItem } from '../types/checklist'

type ChecklistPanelProps = {
  checklist: readonly ChecklistItem[]
  onAddItem: (text: string) => boolean
  onToggleItem: (id: string) => void
  onReset: () => void
  onDeleteItem: (id: string) => void
}

function ChecklistPanel({
  checklist,
  onAddItem,
  onToggleItem,
  onReset,
  onDeleteItem,
}: ChecklistPanelProps) {
  const [newItemText, setNewItemText] = useState('')

  function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    const wasAdded = onAddItem(newItemText)

    if (wasAdded) {
      setNewItemText('')
    }
  }

  return (
    <article className="panel">
      <h2>配信準備</h2>

      <form
        className="checklist-form"
        onSubmit={handleSubmit}
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
            className={
              item.completed ? 'completed' : ''
            }
          >
            <input
              type="checkbox"
              checked={item.completed}
              onChange={() => onToggleItem(item.id)}
            />

            <span>{item.text}</span>
          </label>

          <button
            className="delete-button"
            type="button"
            onClick={() => onDeleteItem(item.id)}
            aria-label={`${item.text}を削除`}
          >
            削除
          </button>
        </div>
      ))}

      <button type="button" onClick={onReset}>
        チェックをリセット
      </button>
    </article>
  )
}

export default ChecklistPanel