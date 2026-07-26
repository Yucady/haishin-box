import {
  useEffect,
  useState,
  type FormEvent,
} from 'react'
import { STORAGE_KEYS } from '../constants/storageKeys'

type QuickLink = {
  id: string
  name: string
  url: string
}

const initialQuickLinks: QuickLink[] = [
  {
    id: 'youtube-studio',
    name: 'YouTube Studio',
    url: 'https://studio.youtube.com/',
  },
]

function normalizeUrl(input: string): string | null {
  const trimmedUrl = input.trim()

  if (trimmedUrl === '') {
    return null
  }

  const urlWithProtocol = /^https?:\/\//i.test(trimmedUrl)
    ? trimmedUrl
    : `https://${trimmedUrl}`

  try {
    const parsedUrl = new URL(urlWithProtocol)

    if (
      parsedUrl.protocol !== 'http:' &&
      parsedUrl.protocol !== 'https:'
    ) {
      return null
    }

    return parsedUrl.toString()
  } catch {
    return null
  }
}

function loadQuickLinks(): QuickLink[] {
  const savedLinks = localStorage.getItem(
    STORAGE_KEYS.quickLinks,
  )

  if (savedLinks === null) {
    return initialQuickLinks
  }

  try {
    const parsedLinks = JSON.parse(savedLinks)

    if (!Array.isArray(parsedLinks)) {
      return initialQuickLinks
    }

    return parsedLinks as QuickLink[]
  } catch {
    return initialQuickLinks
  }
}

function QuickLinkPanel() {
  const [quickLinks, setQuickLinks] =
    useState<QuickLink[]>(loadQuickLinks)

  const [newLinkName, setNewLinkName] = useState('')
  const [newLinkUrl, setNewLinkUrl] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEYS.quickLinks,
        JSON.stringify(quickLinks),
      )
    } catch (error) {
      console.error(
        'クイックリンクを保存できませんでした。',
        error,
      )
    }
  }, [quickLinks])

  function addQuickLink(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    const normalizedUrl = normalizeUrl(newLinkUrl)

    if (normalizedUrl === null) {
      setErrorMessage('正しいURLを入力してください。')
      return
    }

    const trimmedName = newLinkName.trim()

    const linkName =
      trimmedName === ''
        ? new URL(normalizedUrl).hostname
        : trimmedName

    const newLink: QuickLink = {
      id: crypto.randomUUID(),
      name: linkName,
      url: normalizedUrl,
    }

    setQuickLinks((currentLinks) => [
      ...currentLinks,
      newLink,
    ])

    setNewLinkName('')
    setNewLinkUrl('')
    setErrorMessage('')
  }

  function deleteQuickLink(id: string) {
    setQuickLinks((currentLinks) =>
      currentLinks.filter((link) => link.id !== id),
    )
  }

  return (
    <article className="panel">
      <h2>クイックリンク</h2>

      <form
        className="quick-link-form"
        onSubmit={addQuickLink}
      >
        <input
          type="text"
          value={newLinkName}
          onChange={(event) =>
            setNewLinkName(event.target.value)
          }
          placeholder="リンク名（省略可能）"
          maxLength={40}
          aria-label="リンク名"
        />

        <input
          type="text"
          value={newLinkUrl}
          onChange={(event) =>
            setNewLinkUrl(event.target.value)
          }
          placeholder="https://example.com"
          maxLength={500}
          aria-label="URL"
        />

        <button type="submit">リンクを追加</button>
      </form>

      {errorMessage !== '' && (
        <p className="form-error" role="alert">
          {errorMessage}
        </p>
      )}

      <div className="quick-link-list">
        {quickLinks.length === 0 ? (
          <p className="empty-message">
            登録されているリンクはありません。
          </p>
        ) : (
          quickLinks.map((link) => (
            <div className="quick-link-row" key={link.id}>
              <a
                href={link.url}
                target="_blank"
                rel="noreferrer"
              >
                {link.name}
              </a>

              <button
                className="delete-button"
                type="button"
                onClick={() => deleteQuickLink(link.id)}
                aria-label={`${link.name}を削除`}
              >
                削除
              </button>
            </div>
          ))
        )}
      </div>
    </article>
  )
}

export default QuickLinkPanel