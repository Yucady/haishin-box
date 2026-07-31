import { describe, expect, it } from 'vitest'

import {
  createEmptyStreamSession,
  type StreamSession,
} from '../types/streamSession'
import { createStreamStartPlan } from './streamStart'

function createSession(
  overrides: Partial<StreamSession> = {},
): StreamSession {
  return {
    ...createEmptyStreamSession(),
    ...overrides,
  }
}

describe('createStreamStartPlan', () => {
  it('방송 상태를 live로 변경하고 정보는 유지한다', () => {
    const session = createSession({
      title: '雑談配信',
      scheduledAt: '2026-07-31T20:00',
      streamUrl: 'https://example.com/live',
      hashtags: '#雑談 #配信',
      status: 'preparing',
      notificationsEnabled: true,
      notificationMinutes: [30, 5],
      notifiedMinutes: [30],
    })

    const plan = createStreamStartPlan(session)

    expect(plan.streamSession).toEqual({
      ...session,
      status: 'live',
    })

    expect(plan.streamSession).not.toBe(session)
  })

  it('방송 시작 상태의 X 공지를 생성한다', () => {
    const session = createSession({
      title: '雑談配信',
      streamUrl: 'https://example.com/live',
      hashtags: '#雑談 #配信',
    })

    const plan = createStreamStartPlan(session)

    expect(plan.xPostDraft).toBe(
      '配信を開始しました！\n\n' +
        '【雑談配信】\n\n' +
        'https://example.com/live\n\n' +
        '#雑談 #配信',
    )
  })

  it('기존 방송 정보를 직접 변경하지 않는다', () => {
    const session = createSession({
      status: 'preparing',
    })

    createStreamStartPlan(session)

    expect(session.status).toBe('preparing')
  })
})