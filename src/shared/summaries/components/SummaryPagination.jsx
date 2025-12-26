// src/shared/summaries/components/SummaryPagination.jsx
import React from 'react'
import PropTypes from 'prop-types'

export default function SummaryPagination({
  page, setPage, totalPages,
  pageSize, setPageSize, options = [5,10,20,50],
}) {
  return (
    <div className="tss-pagination">
      <div className="tss-pagination__controls">
        <label className="muted" htmlFor="sum-page-size">Na stronę:</label>
        <select
          id="sum-page-size"
          className="tss-select"
          value={pageSize}
          onChange={e => { setPageSize(Number(e.target.value) || pageSize); setPage(1) }}
        >
          {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>

        <button className="tss-btn" onClick={() => setPage(1)} disabled={page <= 1} aria-label="Pierwsza">«</button>
        <button className="tss-btn" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} aria-label="Poprzednia">‹</button>
        <span className="tss-page-indicator" aria-live="polite">{page} / {totalPages}</span>
        <button className="tss-btn" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages} aria-label="Następna">›</button>
        <button className="tss-btn" onClick={() => setPage(totalPages)} disabled={page >= totalPages} aria-label="Ostatnia">»</button>
      </div>
    </div>
  )
}
SummaryPagination.propTypes = {
  page: PropTypes.number.isRequired,
  setPage: PropTypes.func.isRequired,
  totalPages: PropTypes.number.isRequired,
  pageSize: PropTypes.number.isRequired,
  setPageSize: PropTypes.func.isRequired,
  options: PropTypes.array,
}
