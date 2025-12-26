// src/features/reporting/components/SummaryInline.jsx
import React, { memo } from 'react'

function SummaryInline({ stats, className = 'ss__sumline', ariaLabel = 'Podsumowanie wyników' }) {
  if (!stats) return null

  const {
    months = 0,
    orders = 0,
    revenueFmt = '—',
    avgOrderFmt = '—',
    pipelineFmt = '—',
    wonFmt = '—',
    winRateFmt = '—',
  } = stats

  return (
    <div className={className} role="region" aria-label={ariaLabel}>
      <strong>Wyniki:</strong>
      <span>{months} mies.</span><span className="sep">·</span>
      <span>Zleceń: {orders}</span><span className="sep">·</span>
      <span>Przychód: {revenueFmt}</span><span className="sep">·</span>
      <span>Śr. zlecenie: {avgOrderFmt}</span><span className="sep">·</span>
      <span>Pipeline: {pipelineFmt}</span><span className="sep">·</span>
      <span>Wygrane: {wonFmt}</span><span className="sep">·</span>
      <span>Win rate: {winRateFmt}</span>
    </div>
  )
}

// lekka memoizacja – porównujemy kluczowe pola i propsy stylujące
export default memo(SummaryInline, (prev, next) => {
  const a = prev.stats || {}, b = next.stats || {}
  return (
    a.months === b.months &&
    a.orders === b.orders &&
    a.revenueFmt === b.revenueFmt &&
    a.avgOrderFmt === b.avgOrderFmt &&
    a.pipelineFmt === b.pipelineFmt &&
    a.wonFmt === b.wonFmt &&
    a.winRateFmt === b.winRateFmt &&
    prev.className === next.className &&
    prev.ariaLabel === next.ariaLabel
  )
})
