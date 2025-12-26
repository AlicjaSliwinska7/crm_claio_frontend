import React from 'react'

/**
 * Uniwersalna paginacja do tabel/list.
 * - Wspiera: pierwsza / poprzednia / wskaźnik / następna / ostatnia
 * - Opcjonalny wybór pageSize
 * - Warianty wyglądu przez klasy: ghost (default) / solid / pill + compact + primary
 *
 * WYMAGA globalnych styli: src/styles/pagination.css (import w App.jsx lub na stronie).
 */
export default function Pagination({
  page,
  totalPages,
  pageSize,
  onPageSizeChange,
  setPage,
  totalRows,
  pageSizeOptions = [10, 25, 50, 100],
  showPageSize = true,
  variant = 'ghost',   // 'ghost' | 'solid' | 'pill'
  size = 'default',    // 'default' | 'compact'
  accent = 'primary',  // 'primary' | undefined
}) {
  const canPrev = page > 1
  const canNext = page < (totalPages || 1)

  const rootCls = [
    'pagination',
    variant === 'solid' && 'pagination--solid',
    variant === 'pill' && 'pagination--pill',
    size === 'compact' && 'pagination--compact',
    accent === 'primary' && 'pagination--primary',
  ].filter(Boolean).join(' ')

  const goFirst = () => canPrev && setPage(1)
  const goPrev  = () => canPrev && setPage(p => Math.max(1, p - 1))
  const goNext  = () => canNext && setPage(p => Math.min(totalPages || 1, p + 1))
  const goLast  = () => canNext && setPage(totalPages || 1)

  const onSizeChange = (e) => {
    const val = parseInt(e.target.value, 10)
    if (Number.isFinite(val) && onPageSizeChange) {
      onPageSizeChange(val)
      // po zmianie pageSize sensownie wróć na 1 stronę
      setPage(1)
    }
  }

  return (
    <div className={rootCls} role="navigation" aria-label="Paginacja">
      <div className="pagination__info">
        Strona {page} z {totalPages || 1} • {totalRows ?? 0} wierszy
      </div>

      <div className="pagination__controls">
        <button
          className="pagination__btn"
          onClick={goFirst}
          disabled={!canPrev}
          aria-label="Pierwsza strona"
          title="Pierwsza strona"
        >
          «
        </button>
        <button
          className="pagination__btn"
          onClick={goPrev}
          disabled={!canPrev}
          aria-label="Poprzednia strona"
          title="Poprzednia strona"
        >
          ‹
        </button>

        <span className="pagination__page" aria-live="polite">
          {page}/{totalPages || 1}
        </span>

        <button
          className="pagination__btn"
          onClick={goNext}
          disabled={!canNext}
          aria-label="Następna strona"
          title="Następna strona"
        >
          ›
        </button>
        <button
          className="pagination__btn"
          onClick={goLast}
          disabled={!canNext}
          aria-label="Ostatnia strona"
          title="Ostatnia strona"
        >
          »
        </button>

        {showPageSize && onPageSizeChange && (
          <label className="pagination__size" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <span className="pagination__info">na stronę</span>
            <select
              className="pagination__select"
              value={pageSize}
              onChange={onSizeChange}
              aria-label="Liczba wierszy na stronę"
            >
              {pageSizeOptions.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </label>
        )}
      </div>
    </div>
  )
}
