type StreamStartControlProps = {
  checklistTotal: number
  incompleteChecklistCount: number
  isTimerRunning: boolean
  isLive: boolean
  hasXPostDraft: boolean
  onStart: () => void
}

function StreamStartControl({
  checklistTotal,
  incompleteChecklistCount,
  isTimerRunning,
  isLive,
  hasXPostDraft,
  onStart,
}: StreamStartControlProps) {
  const completedChecklistCount =
    checklistTotal - incompleteChecklistCount

  const hasIncompleteChecklist =
    incompleteChecklistCount > 0

  const isStartComplete =
    isLive && isTimerRunning && hasXPostDraft

  return (
    <article className="panel stream-start-control">
      <div className="stream-start-header">
        <div>
          <h2>配信開始アシスト</h2>

          <p>
            配信状態・タイマー・X告知下書きを
            まとめて開始します。
          </p>
        </div>

        <button
          type="button"
          className="stream-start-button"
          onClick={onStart}
          disabled={isStartComplete}
        >
          {isStartComplete
            ? '配信開始済み'
            : '配信を開始する'}
        </button>
      </div>

      <div
        className="stream-start-summary"
        aria-live="polite"
      >
        <span
          className={
            hasIncompleteChecklist
              ? 'stream-start-badge warning'
              : 'stream-start-badge ready'
          }
        >
          {checklistTotal === 0
            ? '準備項目なし'
            : `準備 ${completedChecklistCount}/${checklistTotal}`}
        </span>

        <span
          className={
            isTimerRunning
              ? 'stream-start-badge ready'
              : 'stream-start-badge'
          }
        >
          {isTimerRunning
            ? 'タイマー：計測中'
            : 'タイマー：停止中'}
        </span>

        <span
          className={
            isLive
              ? 'stream-start-badge ready'
              : 'stream-start-badge'
          }
        >
          {isLive
            ? '配信状態：配信中'
            : '配信状態：開始前'}
        </span>

        <span
          className={
            hasXPostDraft
              ? 'stream-start-badge ready'
              : 'stream-start-badge'
          }
        >
          {hasXPostDraft
            ? 'X下書き：あり'
            : 'X下書き：なし'}
        </span>
      </div>
    </article>
  )
}

export default StreamStartControl