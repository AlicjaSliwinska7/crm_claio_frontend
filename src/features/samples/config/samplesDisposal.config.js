// src/features/sales/config/samplesDisposal.config.js
import React from 'react'

/* ============================== Stałe widoków ============================== */
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
export const csvColumnsFor = (view) => {
  if (view === VIEW_ACTIVE) {
    return [
      { key: 'sampleNo', header: 'Nr próbki' },
      { key: 'orderNo', header: 'Nr zlecenia/umowy' },
      { key: 'item', header: 'Przedmiot badań' },
      { key: 'qty', header: 'Ilość próbek' },
      { key: 'weightKg', header: 'Waga próbek [kg]' },
      { key: 'disposalCost', header: 'Koszt utylizacji' },
      { key: 'disposed', header: 'Zutylizowane' },
      { key: 'disposedAt', header: 'Data utylizacji' },
      { key: 'id', header: 'ID' },
    ]
  }
  return [
    { key: 'sampleNo', header: 'Nr próbki' },
    { key: 'orderNo', header: 'Nr zlecenia/umowy' },
    { key: 'item', header: 'Przedmiot badań' },
    { key: 'qty', header: 'Ilość próbek' },
    { key: 'weightKg', header: 'Waga próbek [kg]' },
    { key: 'disposalCost', header: 'Koszt utylizacji' },
    { key: 'disposedAt', header: 'Data utylizacji' },
    { key: 'id', header: 'ID' },
  ]
}

/* ============================== Kolumny (fabryka) ============================== */
/**
 * Zwraca obiekt:
 * {
 *   [VIEW_ACTIVE]: [...],
 *   [VIEW_ARCHIVE]: [...]
 * }
 * i wstrzykujemy handlerami z komponentu:
 *  - openConfirm
 *  - patchArchive
 *  - restoreToActive
 */
export const makeColumns = ({ LinkCmp, handlers }) => {
  const { openConfirm, patchArchive, restoreToActive } = handlers

  const ACTIVE_COLS = [
    {
      key: 'sampleNo',
      label: 'Nr próbki',
      sortable: true,
      type: 'string',
      render: (row) =>
        row.sampleNo ? (
          <LinkCmp to={`/probki/rejestr-probek?sample=${encodeURIComponent(row.sampleNo)}`}>
            {row.sampleNo}
          </LinkCmp>
        ) : (
          '—'
        ),
    },
    {
      key: 'orderNo',
      label: 'Nr zlecenia/umowy',
      sortable: true,
      type: 'string',
      render: (row) =>
        row.orderNo ? (
          <LinkCmp to={`/sprzedaz/rejestr-zlecen?order=${encodeURIComponent(row.orderNo)}`}>
            {row.orderNo}
          </LinkCmp>
        ) : (
          '—'
        ),
    },
    {
      key: 'item',
      label: 'Przedmiot badań',
      sortable: true,
      type: 'string',
      render: (row) => <span title={row.item}>{row.item || '—'}</span>,
    },
    { key: 'qty', label: 'Ilość próbek', sortable: true, type: 'number' },
    { key: 'weightKg', label: 'Waga próbek [kg]', sortable: true, type: 'number' },
    { key: 'disposalCost', label: 'Koszt utylizacji', sortable: true, type: 'string' },
    {
      key: 'disposed',
      label: 'Zutylizowane?',
      sortable: false,
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
    {
      key: 'sampleNo',
      label: 'Nr próbki',
      sortable: true,
      type: 'string',
      render: (row) =>
        row.sampleNo ? (
          <LinkCmp to={`/probki/rejestr-probek?sample=${encodeURIComponent(row.sampleNo)}`}>
            {row.sampleNo}
          </LinkCmp>
        ) : (
          '—'
        ),
    },
    {
      key: 'orderNo',
      label: 'Nr zlecenia/umowy',
      sortable: true,
      type: 'string',
      render: (row) =>
        row.orderNo ? (
          <LinkCmp to={`/sprzedaz/rejestr-zlecen?order=${encodeURIComponent(row.orderNo)}`}>
            {row.orderNo}
          </LinkCmp>
        ) : (
          '—'
        ),
    },
    {
      key: 'item',
      label: 'Przedmiot badań',
      sortable: true,
      type: 'string',
      render: (row) => <span title={row.item}>{row.item || '—'}</span>,
    },
    { key: 'qty', label: 'Ilość próbek', sortable: true, type: 'number' },
    { key: 'weightKg', label: 'Waga próbek [kg]', sortable: true, type: 'number' },
    { key: 'disposalCost', label: 'Koszt utylizacji', sortable: true, type: 'string' },
    {
      key: 'disposedAt',
      label: 'Data utylizacji',
      sortable: true,
      type: 'date',
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
      label: 'Zutylizowane?',
      sortable: false,
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

  return {
    [VIEW_ACTIVE]: ACTIVE_COLS,
    [VIEW_ARCHIVE]: ARCHIVE_COLS,
  }
}
