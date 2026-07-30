import { describe, expect, it } from 'vitest'

import {
  calculateCountdown,
  formatCountdown,
  type CountdownResult,
} from './countdown'

describe('calculateCountdown', () => {
  it('시작 시간이 비어 있으면 null을 반환한다', () => {
    expect(calculateCountdown('')).toBeNull()
  })

  it('유효하지 않은 시간이면 null을 반환한다', () => {
    expect(
      calculateCountdown('invalid-date'),
    ).toBeNull()
  })

  it('남은 시간을 일·시·분·초로 계산한다', () => {
    const currentTime = Date.UTC(
      2026,
      6,
      30,
      12,
      0,
      0,
    )

    const difference =
      ((1 * 24 + 2) * 60 * 60 + 3 * 60 + 4) *
      1000

    const scheduledAt = new Date(
      currentTime + difference,
    ).toISOString()

    expect(
      calculateCountdown(scheduledAt, currentTime),
    ).toEqual({
      totalMilliseconds: difference,
      days: 1,
      hours: 2,
      minutes: 3,
      seconds: 4,
      hasStarted: false,
    })
  })

  it('시작 시간이 지났으면 0으로 고정한다', () => {
    const currentTime = Date.UTC(
      2026,
      6,
      30,
      12,
      0,
      0,
    )

    const scheduledAt = new Date(
      currentTime - 60_000,
    ).toISOString()

    expect(
      calculateCountdown(scheduledAt, currentTime),
    ).toEqual({
      totalMilliseconds: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      hasStarted: true,
    })
  })
})

describe('formatCountdown', () => {
  function createCountdown(
    overrides: Partial<CountdownResult> = {},
  ): CountdownResult {
    return {
      totalMilliseconds: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      hasStarted: false,
      ...overrides,
    }
  }

  it('시간을 HH:MM:SS 형식으로 표시한다', () => {
    expect(
      formatCountdown(
        createCountdown({
          hours: 2,
          minutes: 3,
          seconds: 4,
        }),
      ),
    ).toBe('02:03:04')
  })

  it('하루 이상이면 일수도 표시한다', () => {
    expect(
      formatCountdown(
        createCountdown({
          days: 1,
          hours: 2,
          minutes: 3,
          seconds: 4,
        }),
      ),
    ).toBe('1日 02:03:04')
  })

  it('시작 시간이 되면 안내 문구를 표시한다', () => {
    expect(
      formatCountdown(
        createCountdown({
          hasStarted: true,
        }),
      ),
    ).toBe('配信開始時刻になりました')
  })
})