import React from 'react'

/**
 * Renderuje przekrojowo-stronicowaną listę w układzie:
 *  - wiersz nagłówka grupy
 *  - N wierszy danych
 *
 * Oczekuje `pageRows` w formacie z SamplesSummary:
 *   - { __kind: 'group', key, label, count }
 *   - { __kind: 'row', row: {...} }
 */
export default function SamplesGroupTable({
  pageRows,
  columns,
  formatMoney, // opcjonalnie używane do kolumny "cost"
}) {
  return (
    <div className="table-wrap" style={{ overflow: 'auto', border: '1px solid rgba(0,0,0,.06)', borderRadius: 10 }}>
      <table className="table table--samples" style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
        <thead>
          <tr>
            {columns.map(col => (
              <th key={col.key} className="th" style={{ textAlign: 'left', padding: '8px 10px', position: 'sticky', top: 0, background: 'var(--tbl-head-bg, #fafafa)', borderBottom: '1px solid rgba(0,0,0,.06)' }}>
                {col.label ?? col.key}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {(!pageRows || pageRows.length === 0) && (
            <tr>
              <td colSpan={columns.length} style={{ padding: 16, textAlign: 'center', color: 'var(--muted, #666)' }}>
                Brak danych do wyświetlenia w wybranym zakresie.
              </td>
            </tr>
          )}

          {pageRows?.map(item => {
            if (item.__kind === 'group') {
              return (
                <tr key={`g-${item.key}`} className="tr-group">
                  <td colSpan={columns.length} style={{ padding: '10px 12px', fontWeight: 600, background: 'var(--tbl-group-bg, #f6f7f8)', borderTop: '1px solid rgba(0,0,0,.06)' }}>
                    {item.label} <span className="muted small" style={{ marginLeft: 8 }}>({item.count})</span>
                  </td>
                </tr>
              )
            }
            const r = item.row
            return (
              <tr key={r.id || `${r.code}-${r.date}`}>
                {columns.map(col => {
                  const raw = typeof col.value === 'function' ? col.value(r) : r[col.key]
                  const val = (col.key === 'cost' && typeof formatMoney === 'function')
                    ? formatMoney(Number(raw))
                    : raw
                  return (
                    <td key={col.key} className="td" style={{ padding: '8px 10px', borderTop: '1px solid rgba(0,0,0,.04)' }}>
                      {val ?? ''}
                    </td>
                  )
                })}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
