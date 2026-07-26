const X_POST_INTENT_URL = 'https://x.com/intent/tweet'

export function createXPostIntentUrl(text: string) {
  const intentUrl = new URL(X_POST_INTENT_URL)

  intentUrl.searchParams.set(
    'text',
    text.normalize('NFC'),
  )

  return intentUrl.toString()
}

export function openXPostComposer(text: string) {
  const popupWidth = Math.min(
    600,
    window.screen.availWidth,
  )

  const popupHeight = Math.min(
    650,
    window.screen.availHeight,
  )

  const popupLeft = Math.max(
    0,
    window.screenX +
      (window.outerWidth - popupWidth) / 2,
  )

  const popupTop = Math.max(
    0,
    window.screenY +
      (window.outerHeight - popupHeight) / 2,
  )

  const composerWindow = window.open(
    createXPostIntentUrl(text),
    'x-post-composer',
    [
      'popup=yes',
      `width=${Math.round(popupWidth)}`,
      `height=${Math.round(popupHeight)}`,
      `left=${Math.round(popupLeft)}`,
      `top=${Math.round(popupTop)}`,
      'scrollbars=yes',
      'resizable=yes',
    ].join(','),
  )

  if (composerWindow === null) {
    return false
  }

  try {
    composerWindow.opener = null
  } catch {
    // 브라우저 보안 정책으로 접근할 수 없는 경우입니다.
  }

  composerWindow.focus()

  return true
}