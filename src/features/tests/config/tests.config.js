// src/features/tests/config/tests.config.js
// SSOT dla Rejestru badań: dane demo, kolumny, CSV, definicje filtrów.

import React from 'react'
import { makeSearchFields } from '../../../shared/tables'

/* =========================================================
   Utils
   ========================================================= */

const toStr = (v) => (v ?? '').toString()

export const norm = (v) =>
  String(v ?? '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')

export const fmtDate = (v) => {
  if (!v) return ''
  const d = v instanceof Date ? v : new Date(String(v))
  if (!Number.isFinite(d.getTime())) return String(v)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

// proste klasy badge – kompatybilne z istniejącym CSS jeśli był
export const statusBadgeClass = (value) => {
  const k = norm(value).replace(/\s+/g, '-')
  return `label-pill label-pill--status label-pill--status-${k}`
}

/* =========================================================
   Filtry (SSOT)
   ========================================================= */

export const STATUS_DEFS = [
  { key: 'czeka na rozpoczecie', label: 'Czeka na rozpoczęcie' },
  { key: 'w trakcie', label: 'W trakcie' },
  { key: 'wstrzymane', label: 'Wstrzymane' },
  { key: 'zakonczone', label: 'Zakończone' },
]

export const OUTCOME_DEFS = [
  { key: 'pozytywny', label: 'Pozytywny' },
  { key: 'negatywny', label: 'Negatywny' },
  { key: 'nie dotyczy', label: 'Nie dotyczy' },
]

/* =========================================================
   Demo
   ========================================================= */

export const initialTests = [
  {
    id: 'TB-2025-001',
    orderNo: 'ZLE/2025/091',
    samples: ['S-0012', 'S-0013', 'S-0014'],
    samplesCount: 3,
    client: 'TechSolutions Sp. z o.o.',
    subject: 'Płyta z tworzywa – seria A',
    standard: 'ISO 527-1:2019',
    method: 'PB-101',
    methodPoint: '5.2.1',
    startDate: '2025-09-05',
    endDate: '2025-09-12',
    status: 'zakończone',
    outcome: 'pozytywny',
  },
  {
    id: 'TB-2025-002',
    orderNo: 'ZLE/2025/094',
    samples: ['S-0042'],
    samplesCount: 1,
    client: 'GreenEnergy S.A.',
    subject: 'Uszczelka EPDM – starzenie',
    standard: 'EN ISO 13485:2016',
    method: 'PB-330',
    methodPoint: '7.3',
    startDate: '2025-09-10',
    endDate: '2025-09-17',
    status: 'wstrzymane',
    outcome: 'nie dotyczy',
  },
  {
    id: 'TB-2025-003',
    orderNo: 'ZLE/2025/097',
    samples: ['S-0050', 'S-0051'],
    samplesCount: 2,
    client: 'Meditech Polska',
    subject: 'Próbki aluminiowe – twardość HRB',
    standard: 'PN-EN 755',
    method: 'PB-055',
    methodPoint: '4.1',
    startDate: '2025-09-11',
    endDate: '2025-09-11',
    status: 'w trakcie',
    outcome: 'negatywny',
  },
  {
    id: 'TB-2025-004',
    orderNo: 'ZLE/2025/103',
    samples: ['S-0062', 'S-0063'],
    samplesCount: 2,
    client: 'PlastForm S.C.',
    subject: 'Kompozyt – zginanie trójpunktowe',
    standard: 'PN-EN 1234:2020',
    method: 'PB-998',
    methodPoint: 'A',
    startDate: '2025-09-20',
    endDate: '2025-09-25',
    status: 'czeka na rozpoczęcie',
    outcome: 'nie dotyczy',
  },
]

/* =========================================================
   Kolumny (kompatybilne z shared/tables HeaderRow/DataTableWithActions)
   - render(value,row)
   ========================================================= */

export const makeTestsColumns = (LinkCmp) => [
  { key: 'id', label: 'ID', sortable: true, type: 'string', minWidth: 160 },

  {
    key: 'orderNo',
    label: 'Nr zlecenia',
    sortable: true,
    type: 'string',
    minWidth: 160,
    render: (_v, row) =>
      row.orderNo ? (
        <LinkCmp
          to={`/sprzedaz/rejestr-zlecen?order=${encodeURIComponent(row.orderNo)}`}
          onClick={(e) => e.stopPropagation()}
        >
          {row.orderNo}
        </LinkCmp>
      ) : (
        '—'
      ),
  },

  {
    key: 'samples',
    label: 'Nr próbek',
    sortable: false,
    type: 'string',
    minWidth: 220,
    render: (_v, row) =>
      (row.samples || []).length > 0
        ? row.samples.map((s, i) => (
            <React.Fragment key={s}>
              <LinkCmp
                to={`/probki/rejestr-probek?sample=${encodeURIComponent(s)}`}
                onClick={(e) => e.stopPropagation()}
              >
                {s}
              </LinkCmp>
              {i < row.samples.length - 1 ? ', ' : ''}
            </React.Fragment>
          ))
        : '—',
  },

  {
    key: 'samplesCount',
    label: 'Ilość',
    sortable: true,
    type: 'number',
    width: 90,
    align: 'right',
    render: (_v, row) => row.samplesCount ?? row.samples?.length ?? '—',
  },

  {
    key: 'client',
    label: 'Klient',
    sortable: true,
    type: 'string',
    minWidth: 220,
    render: (_v, row) =>
      row.client ? (
        <LinkCmp
          to={`/sprzedaz/klienci/${encodeURIComponent(row.client)}`}
          onClick={(e) => e.stopPropagation()}
        >
          {row.client}
        </LinkCmp>
      ) : (
        '—'
      ),
  },

  {
    key: 'status',
    label: 'Status',
    sortable: true,
    type: 'string',
    minWidth: 160,
    render: (_v, row) => <span className={statusBadgeClass(row.status)}>{row.status || '—'}</span>,
  },

  {
    key: 'subject',
    label: 'Przedmiot badawczy',
    sortable: true,
    type: 'string',
    minWidth: 260,
    align: 'left',
    render: (_v, row) => <span title={row.subject}>{row.subject || '—'}</span>,
  },

  {
    key: 'standard',
    label: 'Norma/Dokument',
    sortable: true,
    type: 'string',
    minWidth: 180,
    render: (_v, row) =>
      row.standard ? (
        <LinkCmp
          to={`/dokumentacja/normy?norma=${encodeURIComponent(row.standard)}`}
          onClick={(e) => e.stopPropagation()}
        >
          {row.standard}
        </LinkCmp>
      ) : (
        '—'
      ),
  },

  {
    key: 'method',
    label: 'Metoda',
    sortable: true,
    type: 'string',
    width: 120,
    render: (_v, row) =>
      row.method ? (
        <LinkCmp
          to={`/dokumentacja/metody?code=${encodeURIComponent(row.method)}`}
          onClick={(e) => e.stopPropagation()}
        >
          {row.method}
        </LinkCmp>
      ) : (
        '—'
      ),
  },

  { key: 'methodPoint', label: 'Punkt', sortable: true, type: 'string', width: 90 },

  {
    key: 'startDate',
    label: 'Start',
    sortable: true,
    type: 'date',
    width: 120,
    align: 'center',
    render: (_v, row) => fmtDate(row.startDate),
  },

  {
    key: 'endDate',
    label: 'Koniec',
    sortable: true,
    type: 'date',
    width: 120,
    align: 'center',
    render: (_v, row) => fmtDate(row.endDate),
  },

  {
    key: 'outcome',
    label: 'Wynik',
    sortable: true,
    type: 'string',
    width: 140,
    render: (_v, row) => <span className={statusBadgeClass(row.outcome)}>{row.outcome || '—'}</span>,
  },
]

/* =========================================================
   CSV
   ========================================================= */

export const CSV_COLUMNS = [
  { key: 'id', label: 'ID' },
  { key: 'orderNo', label: 'Nr zlecenia' },
  { key: 'samples', label: 'Numery próbek' },
  { key: 'samplesCount', label: 'Ilość' },
  { key: 'client', label: 'Klient' },
  { key: 'status', label: 'Status' },
  { key: 'subject', label: 'Przedmiot badawczy' },
  { key: 'standard', label: 'Norma/Dokument' },
  { key: 'method', label: 'Metoda' },
  { key: 'methodPoint', label: 'Punkt' },
  { key: 'startDate', label: 'Start' },
  { key: 'endDate', label: 'Koniec' },
  { key: 'outcome', label: 'Wynik' },
]

/* =========================================================
   Wyszukiwanie (SSOT -> shared/tables)
   ========================================================= */

export const getSearchFields = makeSearchFields(
  'id',
  'orderNo',
  'client',
  'subject',
  'standard',
  'method',
  'methodPoint',
  'status',
  'outcome',
  'startDate',
  'endDate',
  (r) => (r?.samples || []).join(' ')
)
