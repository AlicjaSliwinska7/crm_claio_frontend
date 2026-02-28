// src/features/tests/components/TestsSummary/MethodsTable.jsx
import React, { useMemo, memo } from 'react'
import PropTypes from 'prop-types'
import { Table as TableIcon, Search } from 'lucide-react'

import { SummarySection, SummaryCard, SummaryHeader } from '../../../../shared/summaries'
import { ExportCsvButton } from '../../../../shared/tables'

const toStr = (v) => (v ?? '').toString()

function isoDate(v) {
  if (!v) return ''
  const s = String(v).slice(0, 10)
  // prosta walidacja YYYY-MM-DD
  return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : ''
}

function fmtDatePL(v) {
  const s = isoDate(v)
  if (!s) return '—'
  const d = new Date(s)
  if (Number.isNaN(d.getTime())) return '—'
  return new Intl.DateTimeFormat('pl-PL', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(d)
}

/**
 * Tabela metod + filtr akredytacji + wyszukiwarka + paginacja + eksport CSV.
 * Spójna wizualnie: nagłówki sekcji jak w EquipmentSummary (es-*),
 * kontrolki i tabela jak w TestsSummary (tss-*).
 */
function MethodsTable({
  // dane
  rows = [],
  tableRows = [],

  // kontrolki
  filter = '',
  setFilter = () => {},
  accrFilter = 'wszystkie',
  setAccrFilter = () => {},
  sortField = null,
  setSortField = () => {},
  sortAsc = true,
  setSortAsc = () => {},

  // paginacja (sterowana z zewnątrz – zachowujemy API)
  mPage = 1,
  setMPage = () => {},
  mPageSize = 10,
  setMPageSize = () => {},

  // opcjonalnie własny formatter PLN
  fmtPLN = (v) => {
    const n = Number(v)
    if (!Number.isFinite(n)) return '—'
    return new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' }).format(n)
  },
}) {
  // ── gwarancje tablic
  const safeRows = Array.isArray(rows) ? rows : []
  const safeTableRows = Array.isArray(tableRows) ? tableRows : safeRows

  // ── sort helpers
  const handleSort = (f) => {
    if (sortField === f) setSortAsc((p) => !p)
    else {
      setSortField(f)
      setSortAsc(true)
    }
    setMPage(1)
  }
  const sortArrow = (f) => (sortField === f ? (sortAsc ? ' ▲' : ' ▼') : '')
  const ariaSort = (f) => (sortField !== f ? 'none' : sortAsc ? 'ascending' : 'descending')

  // kolumny liczbowe – precyzyjniejszy comparator
  const numericCols = useMemo(
    () => new Set(['testsCount', 'samplesCount', 'avgTATDays', 'revenue', 'laborCost']),
    []
  )

  const sortedRows = useMemo(() => {
    if (!sortField) return safeTableRows
    const arr = [...safeTableRows]
    const cmp = (a, b) => {
      const va = a?.[sortField]
      const vb = b?.[sortField]
      if (numericCols.has(sortField)) {
        const na = Number(va) || 0
        const nb = Number(vb) || 0
        return na - nb
      }
      const sa = String(va ?? '')
      const sb = String(vb ?? '')
      return sa.localeCompare(sb, 'pl')
    }
    arr.sort((a, b) => (sortAsc ? cmp(a, b) : cmp(b, a)))
    return arr
  }, [safeTableRows, sortField, sortAsc, numericCols])

  // ── filtrowanie (tekst + akredytacja)
  const filtered = useMemo(() => {
    const q = toStr(filter).trim().toLowerCase()
    return sortedRows.filter((r) => {
      if (q) {
        const hay = `${r.standard} ${r.methodNo} ${r.methodName}`.toLowerCase()
        if (!hay.includes(q)) return false
      }
      if (accrFilter === 'akredytowane' && !r.accredited) return false
      if (accrFilter === 'nieakredytowane' && r.accredited) return false
      return true
    })
  }, [sortedRows, filter, accrFilter])

  // ── paginacja
  const pageSize = Math.max(5, Number(mPageSize) || 10)
  const total = filtered.length
  const mTotalPages = Math.max(1, Math.ceil(total / pageSize))
  const page = Math.min(Math.max(1, Number(mPage) || 1), mTotalPages)

  const start = (page - 1) * pageSize
  const end = Math.min(total, start + pageSize)
  const visible = useMemo(() => filtered.slice(start, end), [filtered, start, end])

  const rangeLabel = total ? `Wiersze ${start + 1}–${end} z ${total}` : 'Brak wierszy'

  // ── CSV
  const csvColumns = useMemo(
    () => [
      { key: 'standard', label: 'Norma/Dokument' },
      { key: 'methodNo', label: 'Nr metody' },
      { key: 'methodName', label: 'Nazwa metody' },
      { key: 'accredited', label: 'Akredytowana', fmt: (v) => (v ? 'Tak' : 'Nie') },
      { key: 'testsCount', label: 'Liczba badań' },
      { key: 'samplesCount', label: 'Liczba próbek' },
      { key: 'lastPerformedDate', label: 'Ostatnie wykonanie' },
      { key: 'avgTATDays', label: 'Śr. TAT [dni]', fmt: (v) => (v != null ? Number(v).toFixed(1) : '') },
      { key: 'revenue', label: 'Przychód [PLN]', fmt: (v) => fmtPLN(v) },
      { key: 'laborCost', label: 'Koszt RH [PLN]', fmt: (v) => fmtPLN(v) },
    ],
    [fmtPLN]
  )

  const actions = (
    <ExportCsvButton
      filename="metody_badawcze.csv"
      columns={csvColumns}
      rows={filtered}
      title="Eksportuj CSV (wszystkie)"
      ariaLabel="Eksportuj CSV (wszystkie)"
      className="tss-icon-btn tss-btn--icon tss-btn--export"
    />
  )

  const clampPage = (p) => Math.min(Math.max(1, p), mTotalPages)

  return (
    <SummarySection className="es-section">
      <SummaryCard className="es-card">
        <SummaryHeader
          title="Metody badawcze"
          icon={<TableIcon className="es-headIcon" aria-hidden="true" />}
          actions={actions}
        />

        {/* Kontrolki nad tabelą */}
        <div className="es-panel-controls" style={{ alignItems: 'end' }}>
          {/* search */}
          <div className="es-col" style={{ minWidth: 240 }}>
            <label className="es-label" htmlFor="methods-search">
              Wyszukaj
            </label>
            <div className="tss-search">
              <div className="tss-search__box tss-search__box--limit">
                <span className="tss-search__icon" aria-hidden="true">
                  <Search size={16} />
                </span>
                <input
                  id="methods-search"
                  className="tss-input tss-input--search"
                  value={filter}
                  onChange={(e) => {
                    setFilter(e.target.value)
                    setMPage(1)
                  }}
                  placeholder="Norma / nr metody / nazwa…"
                />
              </div>
            </div>
          </div>

          {/* accr */}
          <div className="es-col" style={{ minWidth: 220 }}>
            <label className="es-label" htmlFor="accr-filter">
              Akredytacja
            </label>
            <select
              id="accr-filter"
              className="tss-select"
              title="Filtr akredytacji"
              value={accrFilter}
              onChange={(e) => {
                setAccrFilter(e.target.value)
                setMPage(1)
              }}
            >
              <option value="wszystkie">Wszystkie</option>
              <option value="akredytowane">Akredytowane</option>
              <option value="nieakredytowane">Nieakredytowane</option>
            </select>
          </div>
        </div>

        {/* Tabela */}
        <div className="tss-table-wrap" style={{ marginTop: 12 }}>
          <table className="tss-table" style={{ minWidth: '100%' }}>
            <thead>
              <tr>
                <th onClick={() => handleSort('standard')} title="Sortuj" aria-sort={ariaSort('standard')}>
                  Norma/dokument{sortArrow('standard')}
                </th>
                <th
                  onClick={() => handleSort('methodNo')}
                  title="Sortuj"
                  aria-sort={ariaSort('methodNo')}
                  style={{ width: '1%', whiteSpace: 'nowrap' }}
                >
                  Nr metody{sortArrow('methodNo')}
                </th>
                <th onClick={() => handleSort('methodName')} title="Sortuj" aria-sort={ariaSort('methodName')}>
                  Nazwa metody{sortArrow('methodName')}
                </th>
                <th
                  onClick={() => handleSort('accredited')}
                  title="Sortuj"
                  aria-sort={ariaSort('accredited')}
                  style={{ width: '1%', whiteSpace: 'nowrap' }}
                >
                  Akredytacja{sortArrow('accredited')}
                </th>
                <th
                  onClick={() => handleSort('testsCount')}
                  title="Sortuj"
                  aria-sort={ariaSort('testsCount')}
                  style={{ width: '1%', whiteSpace: 'nowrap' }}
                >
                  Badania{sortArrow('testsCount')}
                </th>
                <th
                  onClick={() => handleSort('samplesCount')}
                  title="Sortuj"
                  aria-sort={ariaSort('samplesCount')}
                  style={{ width: '1%', whiteSpace: 'nowrap' }}
                >
                  Próbek{sortArrow('samplesCount')}
                </th>
                <th
                  onClick={() => handleSort('lastPerformedDate')}
                  title="Sortuj"
                  aria-sort={ariaSort('lastPerformedDate')}
                  style={{ width: '1%', whiteSpace: 'nowrap' }}
                >
                  Ostatnie wykonanie{sortArrow('lastPerformedDate')}
                </th>
                <th
                  onClick={() => handleSort('avgTATDays')}
                  title="Sortuj"
                  aria-sort={ariaSort('avgTATDays')}
                  style={{ width: '1%', whiteSpace: 'nowrap' }}
                >
                  Śr. TAT [dni]{sortArrow('avgTATDays')}
                </th>
                <th
                  onClick={() => handleSort('revenue')}
                  title="Sortuj"
                  aria-sort={ariaSort('revenue')}
                  style={{ width: '1%', whiteSpace: 'nowrap' }}
                >
                  Przychód{sortArrow('revenue')}
                </th>
                <th
                  onClick={() => handleSort('laborCost')}
                  title="Sortuj"
                  aria-sort={ariaSort('laborCost')}
                  style={{ width: '1%', whiteSpace: 'nowrap' }}
                >
                  Koszt RH{sortArrow('laborCost')}
                </th>
              </tr>
            </thead>

            <tbody>
              {visible.length ? (
                visible.map((row) => (
                  <tr key={row.id || `${row.methodNo}-${row.standard}`}>
                    <td title={row.standard}>{row.standard}</td>
                    <td style={{ whiteSpace: 'nowrap' }}>{row.methodNo}</td>
                    <td title={row.methodName}>{row.methodName || '—'}</td>
                    <td>{row.accredited ? 'Tak' : 'Nie'}</td>
                    <td>{row.testsCount ?? 0}</td>
                    <td>{row.samplesCount ?? 0}</td>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      {row.lastPerformedDate && row.lastPerformedDate !== '—' ? (
                        <time dateTime={isoDate(row.lastPerformedDate)}>{fmtDatePL(row.lastPerformedDate)}</time>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td>{row.avgTATDays != null ? Number(row.avgTATDays).toFixed(1) : '—'}</td>
                    <td>{fmtPLN(row.revenue)}</td>
                    <td>{fmtPLN(row.laborCost)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="tss-empty" colSpan={10}>
                    Brak danych do wyświetlenia.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Paginacja */}
          <div className="tss-pagination">
            <div className="tss-pagination__info">{rangeLabel}</div>

            <div className="tss-pagination__controls">
              <button className="tss-btn" type="button" onClick={() => setMPage(1)} disabled={page <= 1}>
                «
              </button>
              <button className="tss-btn" type="button" onClick={() => setMPage(clampPage(page - 1))} disabled={page <= 1}>
                ‹
              </button>

              <div className="tss-page-indicator">
                {page} / {mTotalPages}
              </div>

              <button
                className="tss-btn"
                type="button"
                onClick={() => setMPage(clampPage(page + 1))}
                disabled={page >= mTotalPages}
              >
                ›
              </button>
              <button className="tss-btn" type="button" onClick={() => setMPage(mTotalPages)} disabled={page >= mTotalPages}>
                »
              </button>

              <select
                className="tss-select"
                value={pageSize}
                onChange={(e) => {
                  setMPageSize(Number(e.target.value))
                  setMPage(1)
                }}
                title="Rozmiar strony"
                aria-label="Rozmiar strony"
              >
                {[10, 20, 50, 100].map((n) => (
                  <option key={n} value={n}>
                    {n} / str.
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </SummaryCard>
    </SummarySection>
  )
}

MethodsTable.propTypes = {
  rows: PropTypes.array,
  tableRows: PropTypes.array,
  filter: PropTypes.string,
  setFilter: PropTypes.func,
  accrFilter: PropTypes.string,
  setAccrFilter: PropTypes.func,
  sortField: PropTypes.string,
  setSortField: PropTypes.func,
  sortAsc: PropTypes.bool,
  setSortAsc: PropTypes.func,
  mPage: PropTypes.number,
  setMPage: PropTypes.func,
  mPageSize: PropTypes.number,
  setMPageSize: PropTypes.func,
  fmtPLN: PropTypes.func,
}

export default memo(MethodsTable)