// src/components/pages/contents/TestProgram.js
import React, { useMemo, useState } from 'react'
import { Link, useParams, useNavigate, useSearchParams } from 'react-router-dom'
import '../../../features/lists/styles/List.css'
import { FileText } from 'lucide-react'

// 🧩 wspólne komponenty list
import ListLayout from '../../lists/components/ListLayout'
import SearchBar from '../../lists/components/SearchBar'
import Pagination from '../../lists/components/Pagination'
import EmptyStateRow from '../../lists/components/EmptyStateRow'
import SortableTh from '../../lists/components/SortableTh'
import ActionsHeader from '../../lists/components/ActionsHeader'
import ActionsCell from '../../lists/components/ActionsCell'
import ListSummary from '../../lists/components/ListSummary'

// 🧰 utils + hooki dla list
import { sortRows } from '../../lists/utils/sorters'
import { downloadCsv } from '../../lists/utils/csv'
import { useUrlPagination } from '../../lists/hooks/usePagination'

/* ============================== Stałe ============================== */
const PAGE_SIZE = 50
const toStr = v => (v ?? '').toString()
const norm = s => String(s || '').trim().toLowerCase()
const statusBadgeClass = s =>
  `status-badge status-${String(s).toLowerCase().replaceAll(' ', '-').replaceAll('/', '-')}`

const KNOWN_STATUSES = [
  'czeka na rozpoczęcie',
  'wstrzymane',
  'w trakcie',
  'zakończone',
]

/* =============================== Demo dane =============================== */
const DEMO_TESTS = [
  { id: 'TEST-091-01', orderNo: 'ZLE/2025/091', client: 'TechSolutions Sp. z o.o.', sample: 'S-0012', subject: 'Płyta z tworzywa – rozciąganie', standard: 'ISO 527-1:2019', method: 'PB-101', methodPoint: '5.2.1', startDate: '2025-09-05', endDate: '2025-09-05', status: 'zakończone' },
  { id: 'TEST-091-02', orderNo: 'ZLE/2025/091', client: 'TechSolutions Sp. z o.o.', sample: 'S-0013', subject: 'Płyta z tworzywa – rozciąganie', standard: 'ISO 527-1:2019', method: 'PB-101', methodPoint: '5.2.1', startDate: '2025-09-05', endDate: '2025-09-05', status: 'zakończone' },
  { id: 'TEST-094-01', orderNo: 'ZLE/2025/094', client: 'GreenEnergy S.A.', sample: 'S-0042', subject: 'EPDM – starzenie, Δmasa/Δtwardość', standard: 'EN ISO 13485:2016', method: 'PB-330', methodPoint: '7.3', startDate: '2025-09-10', endDate: '2025-09-17', status: 'wstrzymane' },
  { id: 'TEST-097-01', orderNo: 'ZLE/2025/097', client: 'Meditech Polska', sample: 'S-0050', subject: 'Aluminium – HRB (3 odciski)', standard: 'PN-EN 755', method: 'PB-055', methodPoint: '4.1', startDate: '2025-09-11', endDate: '2025-09-11', status: 'zakończone' },
  { id: 'TEST-097-02', orderNo: 'ZLE/2025/097', client: 'Meditech Polska', sample: 'S-0051', subject: 'Aluminium – HRB (3 odciski)', standard: 'PN-EN 755', method: 'PB-055', methodPoint: '4.1', startDate: '2025-09-11', endDate: '2025-09-11', status: 'w trakcie' },
  { id: 'TEST-103-01', orderNo: 'ZLE/2025/103', client: 'PlastForm S.C.', sample: 'S-0062', subject: 'Kompozyt – zginanie trójpunktowe', standard: 'PN-EN 1234:2020', method: 'PB-998', methodPoint: 'A', startDate: '2025-09-20', endDate: '2025-09-25', status: 'czeka na rozpoczęcie' },
]

/* =============================== Komponent =============================== */
export default function TestProgram() {
  const navigate = useNavigate()
  const { orderNo } = useParams()
  const [sp, setSp] = useSearchParams()

  // w realu: fetch po orderNo; tutaj: filtr na danych demo
  const all = DEMO_TESTS
  const baseRows = orderNo ? all.filter(t => t.orderNo === orderNo) : all

  // Kontrolki
  const [filter, setFilter] = useState('')
  const [filterStatus, setFilterStatus] = useState('wszystkie')
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'asc' })

  const toKBUrl = (t) =>
    `/badania/rejestr-badan/PB/${encodeURIComponent(orderNo || t.orderNo)}/${encodeURIComponent(t.id)}/KB`

  // Kolumny
  const HEADER_COLS = [
    { key: 'id', label: 'ID badania', sortable: true, type: 'string',
      render: r => (
        <Link to={toKBUrl(r)} onClick={e => e.stopPropagation()}>
          {r.id}
        </Link>
      )
    },
    { key: 'orderNo', label: 'Nr zlecenia', sortable: true, type: 'string',
      render: r => (
        <Link to={`/sprzedaz/rejestr-zlecen?order=${encodeURIComponent(r.orderNo)}`} onClick={e => e.stopPropagation()}>
          {r.orderNo}
        </Link>
      )
    },
    { key: 'sample', label: 'Nr próbki', sortable: true, type: 'string',
      render: r => (
        r.sample
          ? <Link to={`/probki/rejestr-probek?sample=${encodeURIComponent(r.sample)}`} onClick={e => e.stopPropagation()}>{r.sample}</Link>
          : '—'
      )
    },
    { key: 'subject', label: 'Przedmiot', sortable: true, type: 'string',
      render: r => <span title={r.subject}>{toStr(r.subject)}</span>
    },
    { key: 'standard', label: 'Norma/Dokument', sortable: true, type: 'string',
      render: r => r.standard
        ? <Link to={`/dokumentacja/normy?norma=${encodeURIComponent(r.standard)}`} onClick={e => e.stopPropagation()}>{r.standard}</Link>
        : '—'
    },
    { key: 'method', label: 'Metoda', sortable: true, type: 'string',
      render: r => r.method
        ? <Link to={`/dokumentacja/metody?code=${encodeURIComponent(r.method)}`} onClick={e => e.stopPropagation()}>{r.method}</Link>
        : '—'
    },
    { key: 'methodPoint', label: 'Punkt', sortable: true, type: 'string',
      render: r => r.methodPoint || '—'
    },
    { key: 'startDate', label: 'Start', sortable: true, type: 'date' },
    { key: 'endDate', label: 'Koniec', sortable: true, type: 'date' },
    { key: 'status', label: 'Status', sortable: true, type: 'string',
      render: r => <span className={statusBadgeClass(r.status)}>{r.status || '—'}</span>
    },
  ]

  /* =========================== Filtrowanie + sort =========================== */
  const filteredAndSorted = useMemo(() => {
    const q = String(filter || '').toLowerCase()

    let base = (baseRows || []).filter(r => {
      const searchable = [
        r.id, r.orderNo, r.client, r.sample, r.subject, r.standard, r.method, r.methodPoint, r.startDate, r.endDate, r.status
      ].map(toStr).join(' ').toLowerCase()

      const matchesText = searchable.includes(q)
      const matchesStatus = filterStatus === 'wszystkie'
        ? true
        : norm(r.status) === norm(filterStatus)

      return matchesText && matchesStatus
    })

    const typeMap = HEADER_COLS.reduce((acc, c) => {
      if (c.sortable) acc[c.key] = { type: c.type || 'string' }
      return acc
    }, {})

    return sortConfig.key ? sortRows(base, sortConfig, typeMap) : base
  }, [baseRows, filter, filterStatus, sortConfig])

  const totalTests = filteredAndSorted.length

  // 🔢 Podsumowanie (statystyki po statusach)
  const statusSummaryItems = useMemo(() => {
    const counts = new Map()
    for (const r of filteredAndSorted) {
      const k = norm(r.status)
      if (!k) continue
      counts.set(k, (counts.get(k) || 0) + 1)
    }
    const items = [['Badania', totalTests]]
    // najpierw znane statusy
    for (const s of KNOWN_STATUSES) {
      const n = counts.get(norm(s))
      if (n) {
        items.push([s[0].toUpperCase() + s.slice(1), n])
        counts.delete(norm(s))
      }
    }
    // inne (jeśli wystąpią)
    for (const [k, n] of counts) {
      if (n) items.push([k, n])
    }
    return items
  }, [filteredAndSorted, totalTests])

  /* ============================== Paginacja (URL hook) ============================== */
  const { pageCount, currentPage, visible, onPageChange, resetToFirstPage } =
    useUrlPagination(filteredAndSorted, {
      pageSize: PAGE_SIZE,
      searchParams: sp,
      setSearchParams: setSp,
      param: 'page',
      scrollSelector: '.table-container, .test-program',
      canonicalize: true,
    })

  /* ================================ Export CSV ================================ */
  const exportCSV = () => {
    const columns = [
      { key: 'id',          label: 'ID badania' },
      { key: 'orderNo',     label: 'Nr zlecenia' },
      { key: 'client',      label: 'Klient' },
      { key: 'sample',      label: 'Nr próbki' },
      { key: 'subject',     label: 'Przedmiot' },
      { key: 'standard',    label: 'Norma/Dokument' },
      { key: 'method',      label: 'Metoda' },
      { key: 'methodPoint', label: 'Punkt' },
      { key: 'startDate',   label: 'Start' },
      { key: 'endDate',     label: 'Koniec' },
      { key: 'status',      label: 'Status' },
    ]
    downloadCsv({
      filename: orderNo ? `program_badan_${orderNo}.csv` : 'program_badan.csv',
      columns,
      rows: filteredAndSorted,
      delimiter: ';',
      includeHeader: true,
      addBOM: true,
    })
  }

  /* ================================ Render ================================ */
  return (
    <ListLayout
      rootClassName="test-program"
      title={orderNo ? `Program badań – ${orderNo}` : 'Program badań'}
      controlsClassName="tests-controls"
      controls={
        <>
          <SearchBar
            value={filter}
            placeholder="Znajdź badanie..."
            onChange={val => { setFilter(val); resetToFirstPage(true) }}
            onClear={() => { setFilter(''); resetToFirstPage(true) }}
          />
          <select
            value={filterStatus}
            onChange={e => { setFilterStatus(e.target.value); resetToFirstPage(true) }}
            className="training-filter-select"
            title="Filtr statusu"
            style={{ minWidth: 200 }}
          >
            <option value="wszystkie">Wszystkie</option>
            {KNOWN_STATUSES.map(s => (
              <option key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
          {/* ⛔️ brak dodawania/edycji/usuwania */}
        </>
      }
      summary={<ListSummary ariaLabel="Podsumowanie programu badań" items={statusSummaryItems} />}
      footer={
        <div className="table-actions table-actions--inline">
          <Pagination currentPage={currentPage} pageCount={pageCount} onPageChange={onPageChange} />
          <button className="download-btn download-btn--primary" onClick={exportCSV} title="Eksportuj CSV">
            <i className="fa-solid fa-file-export" />
          </button>
        </div>
      }
    >
      <table className="data-table">
        <colgroup>
          {HEADER_COLS.map(col => <col key={col.key} />)}
          <col className="col-actions" />
        </colgroup>

        <thead>
          <tr>
            {HEADER_COLS.map(col =>
              col.sortable ? (
                <SortableTh
                  key={col.key}
                  columnKey={col.key}
                  label={col.label}
                  sortConfig={sortConfig}
                  setSortConfig={setSortConfig}
                  onAfterSort={() => resetToFirstPage(true)}
                />
              ) : (
                <th key={col.key}>{col.label}</th>
              )
            )}
            <ActionsHeader className="actions-col" />
          </tr>
        </thead>

        <tbody>
          {visible.map(test => (
            <tr
              key={test.id}
              className="row-clickable"
              onClick={() => navigate(toKBUrl(test))}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  navigate(toKBUrl(test))
                }
              }}
              tabIndex={0}
              role="button"
              title="Przejdź do Karty Badań"
              aria-label={`Przejdź do Karty Badań ${test.id}`}
              style={{ cursor: 'pointer' }}
            >
              {HEADER_COLS.map(col => (
                <td key={col.key}>
                  {col.render ? col.render(test) : toStr(test[col.key])}
                </td>
              ))}

              <ActionsCell
                actions={[
                  {
                    type: 'link',
                    label: 'Karta Badań',
                    href: toKBUrl(test),
                    icon: FileText,
                    title: 'Karta Badań (dokument)',
                  },
                ]}
                onActionClick={e => e.stopPropagation()}
              />
            </tr>
          ))}

          {visible.length === 0 && <EmptyStateRow colSpan={HEADER_COLS.length + 1} />}
        </tbody>
      </table>
    </ListLayout>
  )
}
