import {
  useEffect,
  useState,
  type FormEvent,
} from 'react'
import twitterText from 'twitter-text'
import { STORAGE_KEYS } from '../constants/storageKeys'
import type { StreamSession } from '../types/streamSession'
import {
  getMissingTemplateVariables,
  replaceTemplateVariables,
  TEMPLATE_VARIABLE_LABELS,
  TEMPLATE_VARIABLES,
} from '../utils/templateVariables'
import { openXPostComposer } from '../utils/xIntent'

type TextTemplate = {
  id: string
  title: string
  content: string
}

type TextTemplatePanelProps = {
  streamSession: StreamSession
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

function TextTemplatePanel({
  streamSession,
}: TextTemplatePanelProps) {
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

  function resolveTemplateContent(
    content: string,
  ): string | null {
    const missingVariables = getMissingTemplateVariables(
      content,
      streamSession,
    )

    if (missingVariables.length > 0) {
      const missingLabels = missingVariables
        .map(
          (variable) =>
            TEMPLATE_VARIABLE_LABELS[variable],
        )
        .join('、')

      const shouldContinue = window.confirm(
        `次の配信情報が入力されていません：${missingLabels}\n空欄のまま続けますか？`,
      )

      if (!shouldContinue) {
        return null
      }
    }

    return replaceTemplateVariables(content, streamSession)
  }

  async function copyFixedText(
    id: string,
    content: string,
  ) {
    const resolvedContent = resolveTemplateContent(content)

    if (resolvedContent === null) {
      return
    }

    try {
      await navigator.clipboard.writeText(resolvedContent)
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

  function openTemplateInX(content: string) {
    const resolvedContent = resolveTemplateContent(content)

    if (resolvedContent === null) {
      return
    }

    const postResult = twitterText.parseTweet(resolvedContent)

    if (!postResult.valid) {
      window.alert(
        '変換後の定型文はXの文字数制限を超えています。',
      )
      return
    }

    const didOpen = openXPostComposer(resolvedContent)

    if (!didOpen) {
      window.alert(
        'ポップアップがブロックされました。ブラウザの設定を確認してください。',
      )
    }
  }



  return (
    <article className="panel text-template-panel">
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

        <div className="template-variable-guide">
          <span>使用できる変数</span>

          <div>
            {TEMPLATE_VARIABLES.map((variable) => (
              <code
                key={variable}
                title={TEMPLATE_VARIABLE_LABELS[variable]}
              >
                {`{${variable}}`}
              </code>
            ))}
          </div>
        </div>

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

                <div className="template-card-actions">
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

                  <button
                    className="x-template-button"
                    type="button"
                    onClick={() =>
                      openTemplateInX(template.content)
                    }
                  >
                    Xで投稿画面を開く
                  </button>
              </div>
            </div>
          ))
        )}
      </div>
    </article>
  )
}

export default TextTemplatePanel