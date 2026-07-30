import type { StreamPreset } from '../types/streamPreset'
import {
  NOTIFICATION_MINUTE_OPTIONS,
  type NotificationMinute,
  type StreamSession,
} from '../types/streamSession'
import { normalizeHashtags } from './streamSessionValidation'

function isNotificationMinute(
  value: unknown,
): value is NotificationMinute {
  return (
    typeof value === 'number' &&
    NOTIFICATION_MINUTE_OPTIONS.some(
      (minute) => minute === value,
    )
  )
}

export function isStreamPreset(
  value: unknown,
): value is StreamPreset {
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
    typeof candidate.name === 'string' &&
    candidate.name.trim() !== '' &&
    typeof candidate.title === 'string' &&
    typeof candidate.streamUrl === 'string' &&
    typeof candidate.hashtags === 'string' &&
    typeof candidate.notificationsEnabled ===
      'boolean' &&
    Array.isArray(candidate.notificationMinutes) &&
    candidate.notificationMinutes.every(
      isNotificationMinute,
    )
  )
}

export function parseStreamPresets(
  value: string | null,
): StreamPreset[] {
  if (value === null) {
    return []
  }

  try {
    const parsedValue: unknown = JSON.parse(value)

    if (!Array.isArray(parsedValue)) {
      return []
    }

    return parsedValue
      .filter(isStreamPreset)
      .map((preset) => ({
        ...preset,
        notificationMinutes:
          NOTIFICATION_MINUTE_OPTIONS.filter(
            (minute) =>
              preset.notificationMinutes.includes(
                minute,
              ),
          ),
      }))
  } catch {
    return []
  }
}

export function createStreamPreset(
  id: string,
  name: string,
  session: StreamSession,
): StreamPreset {
  return {
    id,
    name: name.trim(),
    title: session.title.trim(),
    streamUrl: session.streamUrl.trim(),
    hashtags: normalizeHashtags(session.hashtags),
    notificationsEnabled:
      session.notificationsEnabled,
    notificationMinutes: [
      ...session.notificationMinutes,
    ],
  }
}

export function applyStreamPreset(
  session: StreamSession,
  preset: StreamPreset,
): StreamSession {
  return {
    ...session,
    title: preset.title,
    streamUrl: preset.streamUrl,
    hashtags: preset.hashtags,
    status: 'preparing',
    notificationsEnabled:
      preset.notificationsEnabled,
    notificationMinutes: [
      ...preset.notificationMinutes,
    ],
    notifiedMinutes: [],
  }
}