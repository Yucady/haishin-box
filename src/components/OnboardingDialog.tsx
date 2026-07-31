import {
  useEffect,
  useRef,
} from 'react'
import './OnboardingDialog.css'

type OnboardingDialogProps = {
  isOpen: boolean
  onComplete: () => void
}

function OnboardingDialog({
  isOpen,
  onComplete,
}: OnboardingDialogProps) {
  const startButtonRef =
    useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!isOpen) {
      return
    }

    const previouslyFocusedElement =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null

        function handleDocumentKeyDown(
            event: KeyboardEvent,
            ) {
            if (event.key === 'Escape') {
                onComplete()
                return
            }

            if (event.key === 'Tab') {
                event.preventDefault()
                startButtonRef.current?.focus()
            }
            }

            document.addEventListener(
            'keydown',
            handleDocumentKeyDown,
            )

    const previousOverflow =
      document.body.style.overflow

    document.body.style.overflow = 'hidden'
    startButtonRef.current?.focus()

    return () => {
      document.removeEventListener(
        'keydown',
        handleDocumentKeyDown,
      )

      document.body.style.overflow = previousOverflow
      previouslyFocusedElement?.focus()
    }
  }, [isOpen, onComplete])

  if (!isOpen) {
    return null
  }

  return (
    <div className="onboarding-backdrop">
      <section
        className="onboarding-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="onboarding-title"
        aria-describedby="onboarding-description onboarding-storage-note"
      >
        <div className="onboarding-badge">
          はじめまして
        </div>

        <h2 id="onboarding-title">
          配信準備BOXへようこそ
        </h2>

        <p
          id="onboarding-description"
          className="onboarding-introduction"
        >
          配信前の準備から配信中の確認まで、
          ひとつの画面で管理できます。
        </p>

        <ol className="onboarding-steps">
          <li>
            <span>1</span>

            <div>
              <strong>配信情報を入力</strong>
              <p>
                タイトル・開始予定・URL・
                ハッシュタグをまとめます。
              </p>
            </div>
          </li>

          <li>
            <span>2</span>

            <div>
              <strong>準備を確認</strong>
              <p>
                チェックリストや定型文、
                X告知を準備します。
              </p>
            </div>
          </li>

          <li>
            <span>3</span>

            <div>
              <strong>配信を開始</strong>
              <p>
                タイマーと集中モードを使って
                配信を進められます。
              </p>
            </div>
          </li>
        </ol>

        <div
          id="onboarding-storage-note"
          className="onboarding-privacy-note"
        >
          <strong>データについて</strong>

          <p>
            入力内容はサーバーへ送信されず、
            このブラウザ内に保存されます。
            別の端末へ移す場合はバックアップを
            ご利用ください。
          </p>

          <p>
            Xへの投稿は、開いたXの投稿画面で
            内容を確認してから行われます。
          </p>
        </div>

        <button
          ref={startButtonRef}
          className="onboarding-start-button"
          type="button"
          onClick={onComplete}
        >
          使ってみる
        </button>
      </section>
    </div>
  )
}

export default OnboardingDialog