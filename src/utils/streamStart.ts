import type { StreamSession } from '../types/streamSession'
import { createStreamAnnouncement } from './templateVariables'

export type StreamStartPlan = {
  streamSession: StreamSession
  xPostDraft: string
}

export function createStreamStartPlan(
  currentSession: StreamSession,
): StreamStartPlan {
  const streamSession: StreamSession = {
    ...currentSession,
    status: 'live',
  }

  return {
    streamSession,
    xPostDraft:
      createStreamAnnouncement(streamSession),
  }
}