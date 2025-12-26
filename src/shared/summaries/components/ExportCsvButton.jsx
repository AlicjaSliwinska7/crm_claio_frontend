import React, { memo } from 'react'
import PropTypes from 'prop-types'

/**
 * Ujednolicony przycisk eksportu CSV (ikonka FA w stylu TopMethods.jsx).
 * Nie zależy od shared/lists/utils/csv — ma własny mini-exporter.
 */
function ExportCsvButton({
  filename = 'export.csv',
  columns = [],          // [{ key, label, fmt? }]
  rows = [],             // array of objects
  className = '',
  title = 'Eksportuj CSV (wszystkie)',
  ariaLabel = 'Eksportuj CSV (wszystkie)',
  iconClass = 'fa-solid fa-file-export',
}) {
  const handleExport = () => {
    // --- helpers ---
    const escapeCell = v => `"${String(v ?? '').replaceAll('"', '""')}"`
    const header = columns.map(c => escapeCell(c.label ?? c.key ?? '')).join(';')
    const lines = rows.map(r =>
      columns
        .map(c => {
          const raw = r?.[c.key]
          const val = typeof c.fmt === 'function' ? c.fmt(raw, r) : raw
          return escapeCell(val)
        })
        .join(';')
    )
    const csv = [header, ...lines].join('\r\n')

    // --- download ---
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <button
      type="button"
      className={`tss-btn ${className}`.trim()}
      title={title}
      aria-label={ariaLabel}
      onClick={handleExport}
    >
      <i className={iconClass} aria-hidden="true" />
    </button>
  )
}

ExportCsvButton.propTypes = {
  filename: PropTypes.string,
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      label: PropTypes.string,
      fmt: PropTypes.func,
    })
  ),
  rows: PropTypes.arrayOf(PropTypes.object),
  className: PropTypes.string,
  title: PropTypes.string,
  ariaLabel: PropTypes.string,
  iconClass: PropTypes.string, // pozwala w razie czego podmienić ikonę FA
}

export default memo(ExportCsvButton)
