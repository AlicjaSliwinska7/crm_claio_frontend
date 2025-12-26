import React from 'react'

/**
 * Uniwersalna paginacja z wariantami stylu:
 * - variant="smpl"  → używa klas smpl-*
 * - variant="ss"    → używa klas ss-*
 * Możesz też nadpisać pojedyncze klasy przez prop `classes`.
 */
export default function Pager({
  page,
  totalPages,
  pageSize,
  onPageSizeChange,
  setPage,
  totalRows,
  pageSizeOptions = [6, 12, 24, 36],
  variant = 'ss',         // 'ss' | 'smpl'
  className,              // opcjonalnie: nadpisz container
  idPrefix,               // opcjonalnie: prefiks dla id/for (zapobiega kolizjom)
  classes = {},           // opcjonalne: nadpisania klas BEM (container/info/controls/select/btn/indicator/label)
}) {
  const defaults = {
    ss:   { container: 'ss-pagination',   info: 'ss-pagination__info',   controls: 'ss-pagination__controls',   select: 'ss-select',  btn: 'ss-btn',  indicator: 'ss-page-indicator',  label: 'muted' },
    smpl: { container: 'smpl-pagination', info: 'smpl-pagination__info', controls: 'smpl-pagination__controls', select: 'smpl-select', btn: 'smpl-btn', indicator: 'smpl-page-indicator', label: 'muted' },
  }

  const cx = { ...defaults[variant], ...classes }
  const containerClass = className || cx.container
  const selectId = `${idPrefix || (variant === 'smpl' ? 'smpl' : 'rp')}-page-size`

  const gotoFirst = () => setPage(1)
  const gotoPrev  = () => setPage(p => Math.max(1, p - 1))
  const gotoNext  = () => setPage(p => Math.min(totalPages, p + 1))
  const gotoLast  = () => setPage(totalPages)

  const startIdx = (page - 1) * pageSize
  const endIdx = Math.min(totalRows, startIdx + pageSize)

  return (
    <div className={containerClass}>
      <div className={cx.info}>
        {totalRows > 0 ? `Wiersze ${startIdx + 1}–${endIdx} z ${totalRows}` : 'Brak wierszy do wyświetlenia'}
      </div>
      <div className={cx.controls}>
        <label className={cx.label} htmlFor={selectId}>Na stronę:</label>
        <select
          id={selectId}
          className={cx.select}
          value={pageSize}
          onChange={onPageSizeChange}
          aria-label='Liczba wierszy na stronę'
        >
          {pageSizeOptions.map(opt => (<option key={opt} value={opt}>{opt}</option>))}
        </select>

        <button className={cx.btn} onClick={gotoFirst} disabled={page <= 1} aria-label='Pierwsza strona'>«</button>
        <button className={cx.btn} onClick={gotoPrev}  disabled={page <= 1} aria-label='Poprzednia strona'>‹</button>
        <span className={cx.indicator} aria-live='polite'>{page} / {totalPages}</span>
        <button className={cx.btn} onClick={gotoNext}  disabled={page >= totalPages} aria-label='Następna strona'>›</button>
        <button className={cx.btn} onClick={gotoLast}  disabled={page >= totalPages} aria-label='Ostatnia strona'>»</button>
      </div>
    </div>
  )
}
