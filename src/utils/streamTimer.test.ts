import { describe, expect, it } from 'vitest'

import {
  calculateElapsedSeconds,
  formatElapsedTime,
} from './streamTimer'

describe('calculateElapsedSeconds', () => {
  it('시작 시각과 현재 시각의 차이를 초로 계산한다', () => {
    expect(
      calculateElapsedSeconds(
        1_000,
        66_432,
      ),
    ).toBe(65)
  })

  it('1초 미만의 값은 버린다', () => {
    expect(
      calculateElapsedSeconds(
        1_000,
        2_999,
      ),
    ).toBe(1)
  })

  it('현재 시각이 시작 시각보다 이르면 0을 반환한다', () => {
    expect(
      calculateElapsedSeconds(
        10_000,
        5_000,
      ),
    ).toBe(0)
  })
})

describe('formatElapsedTime', () => {
  it('0초를 표시한다', () => {
    expect(formatElapsedTime(0)).toBe('00:00:00')
  })

  it('시·분·초 형식으로 표시한다', () => {
    expect(
      formatElapsedTime(3_661),
    ).toBe('01:01:01')
  })

  it('24시간이 넘어도 누적 시간으로 표시한다', () => {
    expect(
      formatElapsedTime(90_061),
    ).toBe('25:01:01')
  })

  it('음수와 소수 입력을 안전하게 처리한다', () => {
    expect(formatElapsedTime(-10)).toBe('00:00:00')
    expect(formatElapsedTime(61.9)).toBe('00:01:01')
  })
})