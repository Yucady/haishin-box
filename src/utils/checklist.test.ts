import { describe, expect, it } from 'vitest'

import {
  createDefaultChecklist,
  getIncompleteChecklistItems,
  parseChecklist,
} from './checklist'

describe('createDefaultChecklist', () => {
  it('매번 독립된 기본 체크리스트를 생성한다', () => {
    const firstChecklist =
      createDefaultChecklist()

    const secondChecklist =
      createDefaultChecklist()

    firstChecklist[0].completed = true

    expect(secondChecklist[0].completed).toBe(false)
    expect(secondChecklist).toHaveLength(4)
  })
})

describe('parseChecklist', () => {
  it('저장값이 없거나 손상되면 기본값을 반환한다', () => {
    expect(parseChecklist(null)).toHaveLength(4)
    expect(
      parseChecklist('{invalid-json'),
    ).toHaveLength(4)

    expect(
      parseChecklist(
        JSON.stringify({
          id: 'not-an-array',
        }),
      ),
    ).toHaveLength(4)
  })

  it('유효한 항목을 정리하고 중복 ID를 제거한다', () => {
    const savedValue = JSON.stringify([
      {
        id: ' item-1 ',
        text: ' マイク確認 ',
        completed: false,
      },
      {
        id: 'item-1',
        text: '重複項目',
        completed: true,
      },
      {
        id: 'item-2',
        text: ' OBS起動 ',
        completed: true,
      },
      {
        id: '',
        text: '不正な項目',
        completed: false,
      },
    ])

    expect(parseChecklist(savedValue)).toEqual([
      {
        id: 'item-1',
        text: 'マイク確認',
        completed: false,
      },
      {
        id: 'item-2',
        text: 'OBS起動',
        completed: true,
      },
    ])
  })

  it('사용자가 저장한 빈 배열은 유지한다', () => {
    expect(
      parseChecklist(JSON.stringify([])),
    ).toEqual([])
  })

  it('저장 항목이 전부 잘못됐으면 기본값을 복구한다', () => {
    const savedValue = JSON.stringify([
      {
        id: '',
        text: '',
        completed: 'false',
      },
    ])

    expect(parseChecklist(savedValue)).toHaveLength(4)
  })
})

describe('getIncompleteChecklistItems', () => {
  it('완료되지 않은 항목만 반환한다', () => {
    const checklist = [
      {
        id: 'item-1',
        text: 'マイク確認',
        completed: true,
      },
      {
        id: 'item-2',
        text: 'OBS起動',
        completed: false,
      },
      {
        id: 'item-3',
        text: 'コメント欄確認',
        completed: false,
      },
    ]

    expect(
      getIncompleteChecklistItems(checklist),
    ).toEqual([
      checklist[1],
      checklist[2],
    ])
  })
})