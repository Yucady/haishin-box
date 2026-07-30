import { describe, expect, it } from 'vitest'

import {
  getStreamUrlError,
  hasScheduledTimePassed,
  normalizeHashtags,
} from './streamSessionValidation'

describe('getStreamUrlError', () => {
  it('빈 URL은 허용한다', () => {
    expect(getStreamUrlError('')).toBeNull()
    expect(getStreamUrlError('   ')).toBeNull()
  })

  it('http와 https URL을 허용한다', () => {
    expect(
      getStreamUrlError('https://youtube.com/live'),
    ).toBeNull()

    expect(
      getStreamUrlError('http://example.com'),
    ).toBeNull()
  })

  it('지원하지 않는 프로토콜을 거부한다', () => {
    expect(
      getStreamUrlError('ftp://example.com'),
    ).toBe(
      'http または https のURLを入力してください。',
    )
  })

  it('올바르지 않은 URL을 거부한다', () => {
    expect(getStreamUrlError('example')).toBe(
      '正しい配信URLを入力してください。',
    )
  })
})

describe('normalizeHashtags', () => {
  it('여러 구분자를 공백으로 통일한다', () => {
    expect(
      normalizeHashtags(
        '配信, #雑談、##ゲーム　テスト',
      ),
    ).toBe('#配信 #雑談 #ゲーム #テスト')
  })

  it('중복된 해시태그를 제거한다', () => {
    expect(
      normalizeHashtags(
        '#配信 配信 #雑談 #配信',
      ),
    ).toBe('#配信 #雑談')
  })

  it('내용이 없으면 빈 문자열을 반환한다', () => {
    expect(normalizeHashtags('  , 、，  ')).toBe('')
  })
})

describe('hasScheduledTimePassed', () => {
  const currentTime = Date.UTC(
    2026,
    6,
    30,
    12,
    0,
    0,
  )

  it('시간이 비었거나 잘못됐으면 false를 반환한다', () => {
    expect(
      hasScheduledTimePassed('', currentTime),
    ).toBe(false)

    expect(
      hasScheduledTimePassed(
        'invalid-date',
        currentTime,
      ),
    ).toBe(false)
  })

  it('미래 시간이면 false를 반환한다', () => {
    const scheduledAt = new Date(
      currentTime + 60_000,
    ).toISOString()

    expect(
      hasScheduledTimePassed(
        scheduledAt,
        currentTime,
      ),
    ).toBe(false)
  })

  it('현재 시간과 같으면 true를 반환한다', () => {
    const scheduledAt = new Date(
      currentTime,
    ).toISOString()

    expect(
      hasScheduledTimePassed(
        scheduledAt,
        currentTime,
      ),
    ).toBe(true)
  })

  it('과거 시간이면 true를 반환한다', () => {
    const scheduledAt = new Date(
      currentTime - 60_000,
    ).toISOString()

    expect(
      hasScheduledTimePassed(
        scheduledAt,
        currentTime,
      ),
    ).toBe(true)
  })
})