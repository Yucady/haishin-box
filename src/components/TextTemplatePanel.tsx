import {
  useEffect,
  useState,
  type FormEvent,
} from 'react'
import { STORAGE_KEYS } from '../constants/storageKeys'

type TextTemplate = {
  id: string
  title: string
  content: string
}

const initialTextTemplates: TextTemplate[] = [
  {
    id: 'stream-start',
    title: '配信開始',
    content:
      '配信を開始しました！ぜひ遊びに来てください。',
  },
  {
    id: 'stream-end',
    title: '配信終了',
    content:
      '本日の配信は終了しました。ありがとうございました！',
  },
]

function loadTextTemplates(): TextTemplate[] {
  const savedTemplates = localStorage.getItem(
    STORAGE_KEYS.textTemplates,
  )

  if (savedTemplates === null) {
    return initialTextTemplates
  }

  try {
    const parsedTemplates = JSON.parse(savedTemplates)

    if (!Array.isArray(parsedTemplates)) {
      return initialTextTemplates
    }

    return parsedTemplates as TextTemplate[]
  } catch {
    return initialTextTemplates
  }
}

function TextTemplatePanel() {
  const [textTemplates, setTextTemplates] =
    useState<TextTemplate[]>(loadTextTemplates)

  const [newTemplateTitle, setNewTemplateTitle] =
    useState('')

  const [newTemplateContent, setNewTemplateContent] =
    useState('')

  const [copiedTemplateId, setCopiedTemplateId] =
    useState<string | null>(null)

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEYS.textTemplates,
        JSON.stringify(textTemplates),
      )
    } catch (error) {
      console.error(
        '定型文を保存できませんでした。',
        error,
      )
    }
  }, [textTemplates])

  function addTextTemplate(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    const trimmedTitle = newTemplateTitle.trim()
    const trimmedContent = newTemplateContent.trim()

    if (trimmedContent === '') {
      return
    }

    const newTemplate: TextTemplate = {
      id: crypto.randomUUID(),
      title: trimmedTitle === '' ? '無題' : trimmedTitle,
      content: trimmedContent,
    }

    setTextTemplates((currentTemplates) => [
      ...currentTemplates,
      newTemplate,
    ])

    setNewTemplateTitle('')
    setNewTemplateContent('')
  }

  function deleteTextTemplate(id: string) {
    setTextTemplates((currentTemplates) =>
      currentTemplates.filter(
        (template) => template.id !== id,
      ),
    )
  }

  async function copyFixedText(
    id: string,
    content: string,
  ) {
    try {
      await navigator.clipboard.writeText(content)
      setCopiedTemplateId(id)

      window.setTimeout(() => {
        setCopiedTemplateId((currentId) =>
          currentId === id ? null : currentId,
        )
      }, 2000)
    } catch (error) {
      console.error(
        'テキストをコピーできませんでした。',
        error,
      )

      window.alert('コピーできませんでした。')
    }
  }

  return (
    <article className="panel">
      <h2>定型文</h2>

      <form
        className="template-form"
        onSubmit={addTextTemplate}
      >
        <input
          type="text"
          value={newTemplateTitle}
          onChange={(event) =>
            setNewTemplateTitle(event.target.value)
          }
          placeholder="タイトル"
          maxLength={30}
          aria-label="定型文のタイトル"
        />

        <textarea
          value={newTemplateContent}
          onChange={(event) =>
            setNewTemplateContent(event.target.value)
          }
          placeholder="コピーしたい文章"
          maxLength={300}
          aria-label="定型文の内容"
        />

        <button type="submit">定型文を追加</button>
      </form>

      <div className="template-list">
        {textTemplates.length === 0 ? (
          <p className="empty-message">
            登録されている定型文はありません。
          </p>
        ) : (
          textTemplates.map((template) => (
            <div
              className="template-card"
              key={template.id}
            >
              <div className="template-card-header">
                <h3>{template.title}</h3>

                <button
                  className="delete-button"
                  type="button"
                  onClick={() =>
                    deleteTextTemplate(template.id)
                  }
                  aria-label={`${template.title}を削除`}
                >
                  削除
                </button>
              </div>

              <p>{template.content}</p>

              <button
                type="button"
                onClick={() =>
                  copyFixedText(
                    template.id,
                    template.content,
                  )
                }
                aria-live="polite"
              >
                {copiedTemplateId === template.id
                  ? 'コピーしました'
                  : 'コピー'}
              </button>
            </div>
          ))
        )}
      </div>
    </article>
  )
}

export default TextTemplatePanel