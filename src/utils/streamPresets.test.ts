import { describe, expect, it } from 'vitest'

import {
  createEmptyStreamSession,
  type StreamSession,
} from '../types/streamSession'
import {
  applyStreamPreset,
  createStreamPreset,
  parseStreamPresets,
} from './streamPresets'

function createSession(
  overrides: Partial<StreamSession> = {},
): StreamSession {
  return {
    ...createEmptyStreamSession(),
    ...overrides,
  }
}

describe('createStreamPreset', () => {
  it('현재 방송 정보로 프리셋을 생성한다', () => {
    const session = createSession({
      title: '  定期雑談  ',
      streamUrl: '  https://example.com/live  ',
      hashtags: '雑談, #配信 雑談',
      notificationsEnabled: true,
      notificationMinutes: [30, 5],
    })

    const preset = createStreamPreset(
      'preset-1',
      '  毎週の雑談  ',
      session,
    )

    expect(preset).toEqual({
      id: 'preset-1',
      name: '毎週の雑談',
      title: '定期雑談',
      streamUrl: 'https://example.com/live',
      hashtags: '#雑談 #配信',
      notificationsEnabled: true,
      notificationMinutes: [30, 5],
    })

    expect(preset.notificationMinutes).not.toBe(
      session.notificationMinutes,
    )
  })
})

describe('applyStreamPreset', () => {
  it('프리셋을 적용하고 일정은 유지한다', () => {
    const session = createSession({
      title: '以前のタイトル',
      scheduledAt: '2026-07-30T21:30',
      streamUrl: 'https://old.example.com',
      hashtags: '#以前',
      status: 'ended',
      notificationsEnabled: false,
      notificationMinutes: [],
      notifiedMinutes: [10],
    })

    const preset = createStreamPreset(
      'preset-1',
      '毎週の雑談',
      createSession({
        title: '定期雑談',
        streamUrl: 'https://example.com/live',
        hashtags: '#雑談 #配信',
        notificationsEnabled: true,
        notificationMinutes: [30, 5],
      }),
    )

    const result = applyStreamPreset(
      session,
      preset,
    )

    expect(result).toMatchObject({
      title: '定期雑談',
      scheduledAt: '2026-07-30T21:30',
      streamUrl: 'https://example.com/live',
      hashtags: '#雑談 #配信',
      status: 'preparing',
      notificationsEnabled: true,
      notificationMinutes: [30, 5],
      notifiedMinutes: [],
    })
  })

  it('기존 데이터와 배열을 직접 변경하지 않는다', () => {
    const session = createSession({
      status: 'ended',
      notificationMinutes: [30],
      notifiedMinutes: [30],
    })

    const preset = createStreamPreset(
      'preset-1',
      'テスト',
      createSession({
        notificationMinutes: [10],
      }),
    )

    const result = applyStreamPreset(
      session,
      preset,
    )

    result.notificationMinutes.push(5)

    expect(session.status).toBe('ended')
    expect(session.notificationMinutes).toEqual([30])
    expect(session.notifiedMinutes).toEqual([30])
    expect(preset.notificationMinutes).toEqual([10])
  })
})

describe('parseStreamPresets', () => {
  it('비어 있거나 손상된 데이터는 빈 배열로 처리한다', () => {
    expect(parseStreamPresets(null)).toEqual([])
    expect(parseStreamPresets('{invalid-json')).toEqual([])
    expect(
      parseStreamPresets(
        JSON.stringify({
          id: 'not-an-array',
        }),
      ),
    ).toEqual([])
  })

  it('유효한 프리셋만 남기고 알림 시간을 정리한다', () => {
    const savedValue = JSON.stringify([
      {
        id: 'preset-1',
        name: '毎週の雑談',
        title: '定期雑談',
        streamUrl: 'https://example.com/live',
        hashtags: '#雑談',
        notificationsEnabled: true,
        notificationMinutes: [5, 30, 5],
      },
      {
        id: '',
        name: 'IDなし',
        title: '',
        streamUrl: '',
        hashtags: '',
        notificationsEnabled: false,
        notificationMinutes: [],
      },
      {
        id: 'preset-invalid-minute',
        name: '不正な通知時間',
        title: '',
        streamUrl: '',
        hashtags: '',
        notificationsEnabled: true,
        notificationMinutes: [15],
      },
    ])

    expect(parseStreamPresets(savedValue)).toEqual([
      {
        id: 'preset-1',
        name: '毎週の雑談',
        title: '定期雑談',
        streamUrl: 'https://example.com/live',
        hashtags: '#雑談',
        notificationsEnabled: true,
        notificationMinutes: [30, 5],
      },
    ])
  })
})