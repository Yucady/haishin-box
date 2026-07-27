import type { StreamSession } from '../../types/streamSession'
import type { calculateCountdown } from '../../utils/countdown'
import {
  normalizeHashtags,
  type getStreamUrlError,
} from '../../utils/streamSessionValidation'
import StreamCountdown from './StreamCountdown'

type Countdown = ReturnType<typeof calculateCountdown>
type StreamUrlError = ReturnType<typeof getStreamUrlError>

type StreamInfoFormProps = {
  session: StreamSession
  countdown: Countdown
  streamUrlError: StreamUrlError
  onFieldChange: <Key extends keyof StreamSession>(
    key: Key,
    value: StreamSession[Key],
  ) => void
  onScheduledAtChange: (scheduledAt: string) => void
}

function StreamInfoForm({
  session,
  countdown,
  streamUrlError,
  onFieldChange,
  onScheduledAtChange,
}: StreamInfoFormProps) {
  return (
    <div className="stream-session-form">
      <label className="stream-session-field">
        <span>配信タイトル</span>

        <input
          type="text"
          value={session.title}
          placeholder="今日の配信タイトル"
          onChange={(event) =>
            onFieldChange('title', event.target.value)
          }
        />
      </label>

      <label className="stream-session-field">
        <span>開始予定</span>

        <input
          type="datetime-local"
          value={session.scheduledAt}
          onChange={(event) =>
            onScheduledAtChange(event.target.value)
          }
        />
      </label>

      {countdown && (
        <StreamCountdown countdown={countdown} />
      )}

      <label className="stream-session-field">
        <span>配信URL</span>

        <input
          type="url"
          value={session.streamUrl}
          placeholder="https://..."
          aria-invalid={Boolean(streamUrlError)}
          aria-describedby={
            streamUrlError
              ? 'stream-url-error'
              : undefined
          }
          onChange={(event) =>
            onFieldChange(
              'streamUrl',
              event.target.value,
            )
          }
        />
      </label>

      {streamUrlError && (
        <p
          id="stream-url-error"
          className="stream-field-error"
          role="alert"
        >
          {streamUrlError}
        </p>
      )}

      <label className="stream-session-field">
        <span>ハッシュタグ</span>

        <input
          type="text"
          value={session.hashtags}
          placeholder="#配信 #雑談"
          onChange={(event) =>
            onFieldChange(
              'hashtags',
              event.target.value,
            )
          }
          onBlur={() =>
            onFieldChange(
              'hashtags',
              normalizeHashtags(session.hashtags),
            )
          }
        />
      </label>
    </div>
  )
}

export default StreamInfoForm