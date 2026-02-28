// src/features/sales/config/samplesDisposal.config.js

/* ============================== Stałe widoków ============================== */
export const VIEW_ALL = 'wszystkie'
export const VIEW_ACTIVE = 'do-utylizacji'
export const VIEW_ARCHIVE = 'archiwum-zutylizowane'

export const PAGE_SIZE = 50

export const todayISO = () => new Date().toISOString().slice(0, 10)

/* ============================== Dane startowe (fallback) ============================== */
export const initialDisposal = [
  {
    id: 'DISP-001',
    sampleNo: 'K-AX12/001',
    orderNo: 'ZL/2025/091-01',
    item: 'Płyta kompozytowa X',
    qty: 3,
    weightKg: 1.8,
    disposalCost: '120,00 zł',
    disposed: false,
    disposedAt: '',
  },
  {
    id: 'DISP-002',
    sampleNo: 'K-BT77/004',
    orderNo: 'UM/2025/114-07',
    item: 'Uszczelka EPDM',
    qty: 5,
    weightKg: 0.9,
    disposalCost: '80,00 zł',
    disposed: false,
    disposedAt: '',
  },
]

export const initialDisposalArchive = [
  {
    id: 'DISP-000',
    sampleNo: 'K-Z9X1/003',
    orderNo: 'ZL/2025/080-03',
    item: 'Profil aluminiowy 30x30',
    qty: 2,
    weightKg: 0.6,
    disposalCost: '45,00 zł',
    disposed: true,
    disposedAt: '2025-09-10',
  },
]

/* ============================== CSV (zależne od widoku) ============================== */
// ✅ zgodne z useCsvExport: { key, label }
export const csvColumnsFor = (view) => {
  if (view === VIEW_ALL) {
    return [
      { key: '__viewGroup', label: 'Widok' }, // Aktywne / Archiwum
      { key: 'sampleNo', label: 'Nr próbki' },
      { key: 'orderNo', label: 'Nr zlecenia/umowy' },
      { key: 'item', label: 'Przedmiot badań' },
      { key: 'qty', label: 'Ilość próbek' },
      { key: 'weightKg', label: 'Waga próbek [kg]' },
      { key: 'disposalCost', label: 'Koszt utylizacji' },
      { key: '__done', label: 'Zutylizowane' }, // tak/nie
      { key: '__doneAt', label: 'Data utylizacji' },
      { key: 'id', label: 'ID' },
    ]
  }

  if (view === VIEW_ACTIVE) {
    return [
      { key: 'sampleNo', label: 'Nr próbki' },
      { key: 'orderNo', label: 'Nr zlecenia/umowy' },
      { key: 'item', label: 'Przedmiot badań' },
      { key: 'qty', label: 'Ilość próbek' },
      { key: 'weightKg', label: 'Waga próbek [kg]' },
      { key: 'disposalCost', label: 'Koszt utylizacji' },
      { key: 'disposed', label: 'Zutylizowane' },
      { key: 'disposedAt', label: 'Data utylizacji' },
      { key: 'id', label: 'ID' },
    ]
  }

  // VIEW_ARCHIVE
  return [
    { key: 'sampleNo', label: 'Nr próbki' },
    { key: 'orderNo', label: 'Nr zlecenia/umowy' },
    { key: 'item', label: 'Przedmiot badań' },
    { key: 'qty', label: 'Ilość próbek' },
    { key: 'weightKg', label: 'Waga próbek [kg]' },
    { key: 'disposalCost', label: 'Koszt utylizacji' },
    { key: 'disposedAt', label: 'Data utylizacji' },
    { key: 'id', label: 'ID' },
  ]
}

/* ============================== Kolumny (fabryka) ============================== */
/**
 * makeColumns({ LinkCmp, handlers }) → { [VIEW_*]: COLS[] }
 * UWAGA: render przyjmuje (row), bo page renderuje: col.render(row)
 */
export const makeColumns = ({ LinkCmp, handlers }) => {
  const { openConfirm, patchArchive, restoreToActive } = handlers

  const sampleLink = (row) =>
    row.sampleNo ? (
      <LinkCmp to={`/probki/rejestr-probek?sample=${encodeURIComponent(row.sampleNo)}`}>{row.sampleNo}</LinkCmp>
    ) : (
      '—'
    )

  const orderLink = (row) =>
    row.orderNo ? (
      <LinkCmp to={`/sprzedaz/rejestr-zlecen?order=${encodeURIComponent(row.orderNo)}`}>{row.orderNo}</LinkCmp>
    ) : (
      '—'
    )

  const BASE_COLS = [
    {
      key: 'sampleNo',
      label: 'Nr próbki',
      sortable: true,
      type: 'string',
      width: 160,
      render: sampleLink,
    },
    {
      key: 'orderNo',
      label: 'Nr zlecenia/umowy',
      sortable: true,
      type: 'string',
      width: 170,
      render: orderLink,
    },
    {
      key: 'item',
      label: 'Przedmiot badań',
      sortable: true,
      type: 'string',
      minWidth: 260,
      render: (row) => <span title={row.item}>{row.item || '—'}</span>,
    },
    { key: 'qty', label: 'Ilość próbek', sortable: true, type: 'number', width: 120, align: 'right' },
    { key: 'weightKg', label: 'Waga [kg]', sortable: true, type: 'number', width: 110, align: 'right' },
    { key: 'disposalCost', label: 'Koszt utylizacji', sortable: true, type: 'string', width: 150, align: 'right' },
  ]

  const ACTIVE_COLS = [
    ...BASE_COLS,
    {
      key: 'disposed',
      label: 'Zutylizowane',
      sortable: false,
      type: 'boolean',
      width: 130,
      align: 'center',
      render: (row) => (
        <input
          type="checkbox"
          className="checkbox-lg"
          aria-label="Zutylizowane"
          checked={!!row.disposed}
          onChange={(e) => {
            if (e.target.checked) openConfirm(row)
          }}
          title="Odhacz, aby potwierdzić utylizację (wymaga wyboru daty)"
        />
      ),
    },
  ]

  const ARCHIVE_COLS = [
    ...BASE_COLS,
    {
      key: 'disposedAt',
      label: 'Data utylizacji',
      sortable: true,
      type: 'date',
      width: 160,
      align: 'center',
      render: (row) => (
        <input
          type="date"
          value={row.disposedAt || ''}
          onChange={(e) => patchArchive(row.id, { disposedAt: e.target.value })}
          title="Data utylizacji"
        />
      ),
    },
    {
      key: 'disposed',
      label: 'W arch.',
      sortable: false,
      type: 'boolean',
      width: 100,
      align: 'center',
      render: (row) => (
        <input
          type="checkbox"
          className="checkbox-lg"
          aria-label="Zutylizowane (archiwum)"
          checked
          onChange={(e) => {
            if (!e.target.checked) restoreToActive(row.id)
          }}
          title="Odznacz, aby przywrócić pozycję do listy 'Do utylizacji'"
        />
      ),
    },
  ]

  const ALL_COLS = [
    {
      key: '__viewGroup',
      label: 'Widok',
      sortable: true,
      type: 'string',
      width: 110,
      render: (row) => <span title={row.__viewGroup || ''}>{row.__viewGroup || '—'}</span>,
    },
    ...BASE_COLS,
    {
      key: '__done',
      label: 'Zutylizowane',
      sortable: true,
      type: 'string',
      width: 130,
      align: 'center',
      render: (row) => <span>{row.__done ?? '—'}</span>,
    },
    {
      key: '__doneAt',
      label: 'Data utylizacji',
      sortable: true,
      type: 'date',
      width: 160,
      align: 'center',
      render: (row) => <span>{row.__doneAt || '—'}</span>,
    },
  ]

  return {
    [VIEW_ALL]: ALL_COLS,
    [VIEW_ACTIVE]: ACTIVE_COLS,
    [VIEW_ARCHIVE]: ARCHIVE_COLS,
  }
}