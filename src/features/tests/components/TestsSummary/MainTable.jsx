// src/features/tests/components/TestsSummary/TestsSummaryMainTable.jsx
import React, { memo, useMemo } from 'react'
import PropTypes from 'prop-types'
import { Table as TableIcon } from 'lucide-react'

import { SummarySection, SummaryCard, SummaryHeader } from '../../../../shared/summaries'
import { ExportCsvButton } from '../../../../shared/tables'

const toNum = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0)

function TestsSummaryMainTable({
  tableRows = [],

  sortField,
  setSortField,
  sortAsc,
  setSortAsc,

  mPage = 1,
  setMPage,
  mPageSize = 10,
  setMPageSize,

  fmtPLN,
  title = 'Tabela główna',
}) {
  const safeRows = Array.isArray(tableRows) ? tableRows : []

  const numericCols = useMemo(
    () => new Set(['testsCount', 'samplesCount', 'avgTATDays', 'revenue', 'laborCost']),
    []
  )

  const sorted = useMemo(() => {
    if (!sortField) return safeRows
    const arr = [...safeRows]
    const cmp = (a, b) => {
      const va = a?.[sortField]
      const vb = b?.[sortField]
      if (numericCols.has(sortField)) return toNum(va) - toNum(vb)
      return String(va ?? '').localeCompare(String(vb ?? ''), 'pl')
    }
    arr.sort((a, b) => (sortAsc ? cmp(a, b) : cmp(b, a)))
    return arr
  }, [safeRows, sortField, sortAsc, numericCols])

  const pageSize = Math.max(5, Number(mPageSize) || 10)
  const total = sorted.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const page = Math.min(Math.max(1, Number(mPage) || 1), totalPages)

  const start = (page - 1) * pageSize
  const end = Math.min(total, start + pageSize)
  const visible = useMemo(() => sorted.slice(start, end), [sorted, start, end])

  const handleSort = (f) => {
    if (sortField === f) setSortAsc?.((p) => !p)
    else {
      setSortField?.(f)
      setSortAsc?.(true)
    }
    setMPage?.(1)
  }
  const sortArrow = (f) => (sortField === f ? (sortAsc ? ' ▲' : ' ▼') : '')
  const ariaSort = (f) => (sortField !== f ? 'none' : sortAsc ? 'ascending' : 'descending')

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
      { key: 'revenue', label: 'Przychód [PLN]', fmt: (v) => (fmtPLN ? fmtPLN(v) : String(v ?? '')) },
      { key: 'laborCost', label: 'Koszt RH [PLN]', fmt: (v) => (fmtPLN ? fmtPLN(v) : String(v ?? '')) },
    ],
    [fmtPLN]
  )

  return (
    <SummarySection className="es-section">
      <SummaryCard className="es-card">
        <SummaryHeader
          title={title}
          icon={<TableIcon className="es-headIcon" aria-hidden="true" />}
          actions={
            <ExportCsvButton
              filename="metody_badawcze.csv"
              columns={csvColumns}
              rows={sorted}
              title="Eksportuj CSV (wszystkie)"
              ariaLabel="Eksportuj CSV (wszystkie)"
              className="tss-icon-btn tss-btn--icon tss-btn--export"
            />
          }
        />

        <div className="tss-table-wrap">
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
                visible.map((r) => (
                  <tr key={r.id || `${r.methodNo}-${r.standard}`}>
                    <td title={r.standard}>{r.standard}</td>
                    <td style={{ whiteSpace: 'nowrap' }}>{r.methodNo}</td>
                    <td title={r.methodName}>{r.methodName || '—'}</td>
                    <td>{r.accredited ? 'Tak' : 'Nie'}</td>
                    <td>{r.testsCount ?? 0}</td>
                    <td>{r.samplesCount ?? 0}</td>
                    <td>{r.lastPerformedDate || '—'}</td>
                    <td>{r.avgTATDays != null ? Number(r.avgTATDays).toFixed(1) : '—'}</td>
                    <td>{fmtPLN ? fmtPLN(r.revenue) : String(r.revenue ?? '—')}</td>
                    <td>{fmtPLN ? fmtPLN(r.laborCost) : String(r.laborCost ?? '—')}</td>
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

          <div className="tss-pagination">
            <div className="tss-pagination__info">
              {total ? `Wiersze ${start + 1}–${end} z ${total}` : 'Brak wierszy'}
            </div>

            <div className="tss-pagination__controls">
              <button className="tss-btn" type="button" onClick={() => setMPage?.(1)} disabled={page <= 1}>
                «
              </button>
              <button className="tss-btn" type="button" onClick={() => setMPage?.(page - 1)} disabled={page <= 1}>
                ‹
              </button>

              <div className="tss-page-indicator">
                {page} / {totalPages}
              </div>

              <button className="tss-btn" type="button" onClick={() => setMPage?.(page + 1)} disabled={page >= totalPages}>
                ›
              </button>
              <button className="tss-btn" type="button" onClick={() => setMPage?.(totalPages)} disabled={page >= totalPages}>
                »
              </button>

              <select
                className="tss-select"
                value={pageSize}
                onChange={(e) => {
                  setMPageSize?.(Number(e.target.value))
                  setMPage?.(1)
                }}
                title="Rozmiar strony"
                aria-label="Rozmiar strony"
              >
                {[5, 10, 15, 20, 30].map((n) => (
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

TestsSummaryMainTable.propTypes = {
  tableRows: PropTypes.array,

  sortField: PropTypes.string,
  setSortField: PropTypes.func,
  sortAsc: PropTypes.bool,
  setSortAsc: PropTypes.func,

  mPage: PropTypes.number,
  setMPage: PropTypes.func,
  mPageSize: PropTypes.number,
  setMPageSize: PropTypes.func,

  fmtPLN: PropTypes.func,
  title: PropTypes.string,
}

export default memo(TestsSummaryMainTable)