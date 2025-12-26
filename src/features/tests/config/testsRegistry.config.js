// src/features/tests/config/testsRegistry.config.js
import React from 'react'
import {
  statusBadgeClass,
  fmtDate,
} from '../components/constants'

// 👇 demo jak w oryginalnym pliku
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

/**
 * Fabryka kolumn – tak jak wcześniej, tylko że Link wstrzykujemy z komponentu,
 * żeby config nie musiał importować react-routera.
 */
export const makeTestsColumns = (LinkCmp) => [
  { key: 'id', label: 'ID', sortable: true, type: 'string' },

  {
    key: 'orderNo',
    label: 'Nr zlecenia',
    sortable: true,
    type: 'string',
    render: (row) =>
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
    render: (row) =>
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
    render: (row) => row.samplesCount ?? row.samples?.length ?? '—',
  },

  {
    key: 'client',
    label: 'Klient',
    sortable: true,
    type: 'string',
    render: (row) =>
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
    render: (row) => <span className={statusBadgeClass(row.status)}>{row.status || '—'}</span>,
  },

  {
    key: 'subject',
    label: 'Przedmiot badawczy',
    sortable: true,
    type: 'string',
    align: 'left',
    render: (row) => <span title={row.subject}>{row.subject || '—'}</span>,
  },

  {
    key: 'standard',
    label: 'Norma/Dokument',
    sortable: true,
    type: 'string',
    render: (row) =>
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
    render: (row) =>
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

  {
    key: 'methodPoint',
    label: 'Punkt',
    sortable: true,
    type: 'string',
    render: (row) => row.methodPoint || '—',
  },

  {
    key: 'startDate',
    label: 'Start',
    sortable: true,
    type: 'date',
    render: (row) => fmtDate(row.startDate),
  },

  {
    key: 'endDate',
    label: 'Koniec',
    sortable: true,
    type: 'date',
    render: (row) => fmtDate(row.endDate),
  },

  {
    key: 'outcome',
    label: 'Wynik',
    sortable: true,
    type: 'string',
    render: (row) => <span className={statusBadgeClass(row.outcome)}>{row.outcome || '—'}</span>,
  },
]

// to samo co miałeś w useCsvExport, tylko wyniesione
export const CSV_COLUMNS = [
  { key: 'id', header: 'ID' },
  { key: 'orderNo', header: 'Nr zlecenia' },
  { key: 'samples', header: 'Numery próbek' },
  { key: 'samplesCount', header: 'Ilość' },
  { key: 'client', header: 'Klient' },
  { key: 'status', header: 'Status' },
  { key: 'subject', header: 'Przedmiot badawczy' },
  { key: 'standard', header: 'Norma/Dokument' },
  { key: 'method', header: 'Metoda' },
  { key: 'methodPoint', header: 'Punkt' },
  { key: 'startDate', header: 'Start' },
  { key: 'endDate', header: 'Koniec' },
  { key: 'outcome', header: 'Wynik' },
]
