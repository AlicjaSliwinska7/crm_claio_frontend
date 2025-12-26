// src/features/sales/config/samplesDeliveryPickup.config.js
import React from 'react'

// klucze widoków – muszą się zgadzać z komponentem
export const VIEW_PRE = 'przed-dostawa'
export const VIEW_PICKUP = 'do-odbioru'
export const VIEW_ARCH_DELIVERED = 'arch-dostarczone'
export const VIEW_ARCH_PICKEDUP = 'arch-odebrane'

// mały helper jak w komponencie
export const todayISO = () => new Date().toISOString().slice(0, 10)

// ───────────────────────────────────────────────────────────
// Dane startowe (jak w Twoim komponencie)
// ───────────────────────────────────────────────────────────
export const initialPreDelivery = [
  {
    id: 'PRE-001',
    orderNo: 'ZL/2025/091-01',
    client: 'TechSolutions Sp. z o.o.',
    contactName: 'Jan Kowalski',
    contactPhone: '+48 501 234 567',
    contactEmail: 'j.kowalski@techsolutions.pl',
    item: 'Płyta kompozytowa X',
    qty: 12,
    scope: 'PN-EN 1234:2020; PB-998; 6 pkt',
    etaDelivery: '2025-09-20',
    comment: 'Dostawa paletowa',
    delivered: false,
    deliveredAt: '',
  },
]

export const initialDeliveredHistory = [
  {
    id: 'PRE-002',
    orderNo: 'UM/2025/114-07',
    client: 'GreenEnergy SA',
    contactName: 'Anna Nowak',
    contactPhone: '+48 600 111 222',
    contactEmail: 'a.nowak@greenenergy.pl',
    item: 'Uszczelka EPDM',
    qty: 4,
    scope: 'PB-45/2022; 4 pkt',
    etaDelivery: '2025-09-22',
    comment: '',
    delivered: true,
    deliveredAt: '2025-09-21',
  },
]

export const initialPickup = [
  {
    id: 'PCK-001',
    sampleNo: 'K-AX12/001',
    orderNo: 'ZL/2025/091-01',
    client: 'TechSolutions Sp. z o.o.',
    contactName: 'Jan Kowalski',
    contactPhone: '+48 501 234 567',
    contactEmail: 'j.kowalski@techsolutions.pl',
    item: 'Płyta kompozytowa X',
    qty: 12,
    deliveryParams: 'Temp. pokojowa, oryg. opakowania',
    etaPickup: '2025-09-27',
    pickedUp: false,
    pickedUpAt: '',
  },
]

export const initialPickupHistory = [
  {
    id: 'PCK-002',
    sampleNo: 'K-BT77/001',
    orderNo: 'UM/2025/114-07',
    client: 'GreenEnergy SA',
    contactName: 'Anna Nowak',
    contactPhone: '+48 600 111 222',
    contactEmail: 'a.nowak@greenenergy.pl',
    item: 'Uszczelka EPDM',
    qty: 4,
    deliveryParams: 'Kurier, paczka 2 kg',
    etaPickup: '2025-09-25',
    pickedUp: true,
    pickedUpAt: '2025-09-25',
  },
]

// ───────────────────────────────────────────────────────────
// CSV – to już miałeś w komponencie, tylko przenosimy
// ───────────────────────────────────────────────────────────
export const csvColumnsFor = (view) => {
  if (view === VIEW_PRE) {
    return [
      { key: 'orderNo', header: 'Nr zlecenia' },
      { key: 'client', header: 'Klient' },
      { key: 'contactName', header: 'Osoba kontaktowa' },
      { key: 'contactPhone', header: 'Telefon' },
      { key: 'contactEmail', header: 'E-mail' },
      { key: 'item', header: 'Przedmiot badań' },
      { key: 'qty', header: 'Ilość próbek' },
      { key: 'scope', header: 'Zakres badań' },
      { key: 'etaDelivery', header: 'Przewidywana data dostawy' },
      { key: 'comment', header: 'Uwagi' },
      { key: 'delivered', header: 'Dostarczone' },
      { key: 'deliveredAt', header: 'Data dostawy' },
      { key: 'id', header: 'ID' },
    ]
  }
  if (view === VIEW_PICKUP) {
    return [
      { key: 'sampleNo', header: 'Nr próbki' },
      { key: 'orderNo', header: 'Nr zlecenia' },
      { key: 'client', header: 'Klient' },
      { key: 'contactName', header: 'Osoba kontaktowa' },
      { key: 'contactPhone', header: 'Telefon' },
      { key: 'contactEmail', header: 'E-mail' },
      { key: 'item', header: 'Przedmiot badań' },
      { key: 'qty', header: 'Ilość próbek' },
      { key: 'deliveryParams', header: 'Parametry dostawy' },
      { key: 'etaPickup', header: 'Przewidywana data odbioru' },
      { key: 'pickedUp', header: 'Odebrane' },
      { key: 'pickedUpAt', header: 'Data odbioru' },
      { key: 'id', header: 'ID' },
    ]
  }
  if (view === VIEW_ARCH_DELIVERED) {
    return [
      { key: 'orderNo', header: 'Nr zlecenia' },
      { key: 'client', header: 'Klient' },
      { key: 'contactName', header: 'Osoba kontaktowa' },
      { key: 'contactPhone', header: 'Telefon' },
      { key: 'contactEmail', header: 'E-mail' },
      { key: 'item', header: 'Przedmiot badań' },
      { key: 'qty', header: 'Ilość próbek' },
      { key: 'scope', header: 'Zakres badań' },
      { key: 'deliveredAt', header: 'Data dostawy' },
      { key: 'comment', header: 'Uwagi' },
      { key: 'id', header: 'ID' },
    ]
  }
  // VIEW_ARCH_PICKEDUP
  return [
    { key: 'sampleNo', header: 'Nr próbki' },
    { key: 'orderNo', header: 'Nr zlecenia' },
    { key: 'client', header: 'Klient' },
    { key: 'contactName', header: 'Osoba kontaktowa' },
    { key: 'contactPhone', header: 'Telefon' },
    { key: 'contactEmail', header: 'E-mail' },
    { key: 'item', header: 'Przedmiot badań' },
    { key: 'qty', header: 'Ilość próbek' },
    { key: 'deliveryParams', header: 'Parametry dostawy' },
    { key: 'pickedUpAt', header: 'Data odbioru' },
    { key: 'id', header: 'ID' },
  ]
}

// ───────────────────────────────────────────────────────────
// Fabryka kolumn dla wszystkich widoków
// makeColumns({ LinkCmp, handlers }) → { [viewKey]: COLS[] }
// ───────────────────────────────────────────────────────────
export const makeColumns = ({ LinkCmp, handlers }) => {
  const {
    askConfirmDeliver,
    patchPre,
    askConfirmPickup,
    patchPickup,
    updateDeliveredHistoryDate,
    updatePickupHistoryDate,
    restoreFromDelivered,
    restoreFromPickedUp,
  } = handlers

  const PRE_COLS = [
    {
      key: 'orderNo',
      label: 'Nr zlecenia',
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
      key: 'client',
      label: 'Klient',
      sortable: true,
      type: 'string',
      render: (row) =>
        row.client ? (
          <LinkCmp to={`/sprzedaz/klienci/${encodeURIComponent(row.client)}`}>
            {row.client}
          </LinkCmp>
        ) : (
          '—'
        ),
    },
    {
      key: 'contact',
      label: 'Osoba kontaktowa',
      sortable: false,
      render: (row) => (
        <div style={{ display: 'grid' }}>
          <span>{row.contactName}</span>
          <span>{row.contactPhone}</span>
          {row.contactEmail ? <a href={`mailto:${row.contactEmail}`}>{row.contactEmail}</a> : null}
        </div>
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
    {
      key: 'scope',
      label: 'Zakres badań',
      sortable: true,
      type: 'string',
      render: (row) =>
        row.scope ? (
          <LinkCmp to={`/metody-badawcze/spis?q=${encodeURIComponent(row.scope)}`} title={row.scope}>
            {row.scope}
          </LinkCmp>
        ) : (
          '—'
        ),
    },
    { key: 'etaDelivery', label: 'Przewidywana data dostawy', sortable: true, type: 'date' },
    {
      key: 'delivered',
      label: 'Dostarczone',
      sortable: false,
      render: (row) => (
        <input
          type="checkbox"
          className="checkbox-lg"
          aria-label="Próbka dostarczona"
          checked={!!row.delivered}
          onChange={(e) => {
            if (e.target.checked) askConfirmDeliver(row)
            else patchPre(row.id, { delivered: false, deliveredAt: '' })
          }}
          title="Odhacz, aby potwierdzić dostawę (wymaga wyboru daty)"
        />
      ),
    },
    {
      key: 'comment',
      label: 'Uwagi',
      sortable: false,
      render: (row) => <span title={row.comment}>{row.comment || '—'}</span>,
    },
  ]

  const PICKUP_COLS = [
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
      label: 'Nr zlecenia',
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
      key: 'client',
      label: 'Klient',
      sortable: true,
      type: 'string',
      render: (row) =>
        row.client ? (
          <LinkCmp to={`/sprzedaz/klienci/${encodeURIComponent(row.client)}`}>
            {row.client}
          </LinkCmp>
        ) : (
          '—'
        ),
    },
    {
      key: 'contact',
      label: 'Osoba kontaktowa',
      sortable: false,
      render: (row) => (
        <div style={{ display: 'grid' }}>
          <span>{row.contactName}</span>
          <span>{row.contactPhone}</span>
          {row.contactEmail ? <a href={`mailto:${row.contactEmail}`}>{row.contactEmail}</a> : null}
        </div>
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
    {
      key: 'deliveryParams',
      label: 'Parametry dostawy',
      sortable: false,
      render: (row) => <span title={row.deliveryParams}>{row.deliveryParams || '—'}</span>,
    },
    { key: 'etaPickup', label: 'Przewidywana data odbioru', sortable: true, type: 'date' },
    {
      key: 'pickedUp',
      label: 'Odebrane',
      sortable: false,
      render: (row) => (
        <input
          type="checkbox"
          className="checkbox-lg"
          aria-label="Próbka odebrana"
          checked={!!row.pickedUp}
          onChange={(e) => {
            if (e.target.checked) askConfirmPickup(row)
            else patchPickup(row.id, { pickedUp: false, pickedUpAt: '' })
          }}
          title="Odhacz, aby potwierdzić odbiór (wymaga wyboru daty)"
        />
      ),
    },
  ]

  const ARCH_DELIVERED_COLS = [
    {
      key: 'orderNo',
      label: 'Nr zlecenia',
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
      key: 'client',
      label: 'Klient',
      sortable: true,
      type: 'string',
      render: (row) =>
        row.client ? (
          <LinkCmp to={`/sprzedaz/klienci/${encodeURIComponent(row.client)}`}>
            {row.client}
          </LinkCmp>
        ) : (
          '—'
        ),
    },
    {
      key: 'contact',
      label: 'Osoba kontaktowa',
      sortable: false,
      render: (row) => (
        <div style={{ display: 'grid' }}>
          <span>{row.contactName}</span>
          <span>{row.contactPhone}</span>
          {row.contactEmail ? <a href={`mailto:${row.contactEmail}`}>{row.contactEmail}</a> : null}
        </div>
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
    {
      key: 'scope',
      label: 'Zakres badań',
      sortable: true,
      type: 'string',
      render: (row) =>
        row.scope ? (
          <LinkCmp to={`/metody-badawcze/spis?q=${encodeURIComponent(row.scope)}`} title={row.scope}>
            {row.scope}
          </LinkCmp>
        ) : (
          '—'
        ),
    },
    {
      key: 'deliveredAt',
      label: 'Data dostawy',
      sortable: true,
      type: 'date',
      render: (row) => (
        <input
          type="date"
          value={row.deliveredAt || ''}
          onChange={(e) => updateDeliveredHistoryDate(row, e.target.value)}
          title="Data dostawy"
        />
      ),
    },
    {
      key: 'delivered',
      label: 'Dostarczone',
      sortable: false,
      render: (row) => (
        <input
          type="checkbox"
          className="checkbox-lg"
          aria-label="Dostarczona (archiwum)"
          checked
          onChange={(e) => {
            if (!e.target.checked) restoreFromDelivered(row.id)
          }}
          title="Odznacz, aby przywrócić do listy 'Przed dostawą'"
        />
      ),
    },
    {
      key: 'comment',
      label: 'Uwagi',
      sortable: false,
      render: (row) => <span title={row.comment}>{row.comment || '—'}</span>,
    },
  ]

  const ARCH_PICKEDUP_COLS = [
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
      label: 'Nr zlecenia',
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
      key: 'client',
      label: 'Klient',
      sortable: true,
      type: 'string',
      render: (row) =>
        row.client ? (
          <LinkCmp to={`/sprzedaz/klienci/${encodeURIComponent(row.client)}`}>
            {row.client}
          </LinkCmp>
        ) : (
          '—'
        ),
    },
    {
      key: 'contact',
      label: 'Osoba kontaktowa',
      sortable: false,
      render: (row) => (
        <div style={{ display: 'grid' }}>
          <span>{row.contactName}</span>
          <span>{row.contactPhone}</span>
          {row.contactEmail ? <a href={`mailto:${row.contactEmail}`}>{row.contactEmail}</a> : null}
        </div>
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
    {
      key: 'deliveryParams',
      label: 'Parametry dostawy',
      sortable: false,
      render: (row) => <span title={row.deliveryParams}>{row.deliveryParams || '—'}</span>,
    },
    {
      key: 'pickedUpAt',
      label: 'Data odbioru',
      sortable: true,
      type: 'date',
      render: (row) => (
        <input
          type="date"
          value={row.pickedUpAt || ''}
          onChange={(e) => updatePickupHistoryDate(row, e.target.value)}
          title="Data odbioru"
        />
      ),
    },
    {
      key: 'pickedUp',
      label: 'Odebrane',
      sortable: false,
      render: (row) => (
        <input
          type="checkbox"
          className="checkbox-lg"
          aria-label="Odebrana (archiwum)"
          checked
          onChange={(e) => {
            if (!e.target.checked) restoreFromPickedUp(row.id)
          }}
          title="Odznacz, aby przywrócić do listy 'Do odbioru'"
        />
      ),
    },
  ]

  return {
    [VIEW_PRE]: PRE_COLS,
    [VIEW_PICKUP]: PICKUP_COLS,
    [VIEW_ARCH_DELIVERED]: ARCH_DELIVERED_COLS,
    [VIEW_ARCH_PICKEDUP]: ARCH_PICKEDUP_COLS,
  }
}
