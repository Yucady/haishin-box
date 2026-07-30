import { describe, expect, it } from 'vitest'

import {
  createEmptyStreamSession,
  type StreamSession,
} from '../types/streamSession'
import {
  createStreamAnnouncement,
  getMissingTemplateVariables,
  getTemplateVariableValues,
  replaceTemplateVariables,
} from './templateVariables'

function createSession(
  overrides: Partial<StreamSession> = {},
): StreamSession {
  return {
    ...createEmptyStreamSession(),
    ...overrides,
  }
}

describe('getTemplateVariableValues', () => {
  it('방송 정보를 변수 값으로 변환한다', () => {
    const session = createSession({
      title: '  雑談配信  ',
      scheduledAt: '2026-07-30T21:30',
      streamUrl: '  https://example.com/live  ',
      hashtags: '  #雑談 #配信  ',
    })

    expect(getTemplateVariableValues(session)).toEqual({
      title: '雑談配信',
      date: '2026年7月30日',
      time: '21:30',
      url: 'https://example.com/live',
      hashtags: '#雑談 #配信',
    })
  })

  it('시작 시간이 잘못되면 날짜와 시간을 비운다', () => {
    const session = createSession({
      scheduledAt: 'invalid-date',
    })

    expect(getTemplateVariableValues(session)).toMatchObject({
      date: '',
      time: '',
    })
  })
})

describe('replaceTemplateVariables', () => {
  it('등록된 변수를 실제 값으로 교체한다', () => {
    const session = createSession({
      title: '雑談配信',
      scheduledAt: '2026-07-30T21:30',
      streamUrl: 'https://example.com/live',
      hashtags: '#雑談',
    })

    const template =
      '{date} {time}\n{title}\n{url}\n{hashtags}'

    expect(
      replaceTemplateVariables(template, session),
    ).toBe(
      '2026年7月30日 21:30\n雑談配信\nhttps://example.com/live\n#雑談',
    )
  })

  it('지원하지 않는 변수는 변경하지 않는다', () => {
    const session = createSession({
      title: '雑談配信',
    })

    expect(
      replaceTemplateVariables(
        '{title} {unknown}',
        session,
      ),
    ).toBe('雑談配信 {unknown}')
  })
})

describe('getMissingTemplateVariables', () => {
  it('사용됐지만 값이 없는 변수만 반환한다', () => {
    const session = createSession({
      title: '雑談配信',
    })

    expect(
      getMissingTemplateVariables(
        '{title} {time} {url} {url}',
        session,
      ),
    ).toEqual(['time', 'url'])
  })
})

describe('createStreamAnnouncement', () => {
  it('방송 예정 공지를 생성한다', () => {
    const session = createSession({
      title: '雑談配信',
      scheduledAt: '2026-07-30T21:30',
      streamUrl: 'https://example.com/live',
      hashtags: '#雑談 #配信',
      status: 'preparing',
    })

    expect(createStreamAnnouncement(session)).toBe(
      '2026年7月30日 21:30から配信します！\n\n' +
        '【雑談配信】\n\n' +
        'https://example.com/live\n\n' +
        '#雑談 #配信',
    )
  })

  it('방송 시작 공지를 생성한다', () => {
    const session = createSession({
      title: '雑談配信',
      status: 'live',
    })

    expect(createStreamAnnouncement(session)).toBe(
      '配信を開始しました！\n\n【雑談配信】',
    )
  })

  it('방송 종료 공지를 생성한다', () => {
    const session = createSession({
      status: 'ended',
    })

    expect(createStreamAnnouncement(session)).toBe(
      '本日の配信は終了しました。\nありがとうございました！',
    )
  })

  it('정보가 없으면 기본 공지를 생성한다', () => {
    expect(
      createStreamAnnouncement(createSession()),
    ).toBe('配信のお知らせです！')
  })
})