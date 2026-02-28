// src/features/samples/config/samplesDeliveryPickup.config.js

export const VIEW_ALL = 'wszystkie'
export const VIEW_PRE = 'przed-dostawa'
export const VIEW_PICKUP = 'do-odbioru'
export const VIEW_ARCH_DELIVERED = 'arch-dostarczone'
export const VIEW_ARCH_PICKEDUP = 'arch-odebrane'

export const todayISO = () => new Date().toISOString().slice(0, 10)

// ───────────────────────────────────────────────────────────
// Dane startowe
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
// CSV
// ───────────────────────────────────────────────────────────
export const csvColumnsFor = (view) => {
  if (view === VIEW_ALL) {
    return [
      { key: '__type', label: 'Typ' }, // Dostawa / Odbiór
      { key: 'sampleNo', label: 'Nr próbki' },
      { key: 'orderNo', label: 'Nr zlecenia' },
      { key: 'client', label: 'Klient' },
      { key: 'contactName', label: 'Osoba kontaktowa' },
      { key: 'contactPhone', label: 'Telefon' },
      { key: 'contactEmail', label: 'E-mail' },
      { key: 'item', label: 'Przedmiot badań' },
      { key: 'qty', label: 'Ilość próbek' },
      { key: 'scope', label: 'Zakres badań' },
      { key: 'deliveryParams', label: 'Parametry dostawy' },
      { key: '__eta', label: 'Data planowana (ETA)' },
      { key: '__done', label: 'Wykonane' }, // Dostarczone/Odebrane
      { key: '__doneAt', label: 'Data wykonania' }, // deliveredAt/pickedUpAt
      { key: 'comment', label: 'Uwagi' },
      { key: 'id', label: 'ID' },
    ]
  }

  if (view === VIEW_PRE) {
    return [
      { key: 'orderNo', label: 'Nr zlecenia' },
      { key: 'client', label: 'Klient' },
      { key: 'contactName', label: 'Osoba kontaktowa' },
      { key: 'contactPhone', label: 'Telefon' },
      { key: 'contactEmail', label: 'E-mail' },
      { key: 'item', label: 'Przedmiot badań' },
      { key: 'qty', label: 'Ilość próbek' },
      { key: 'scope', label: 'Zakres badań' },
      { key: 'etaDelivery', label: 'Przewidywana data dostawy' },
      { key: 'comment', label: 'Uwagi' },
      { key: 'delivered', label: 'Dostarczone' },
      { key: 'deliveredAt', label: 'Data dostawy' },
      { key: 'id', label: 'ID' },
    ]
  }

  if (view === VIEW_PICKUP) {
    return [
      { key: 'sampleNo', label: 'Nr próbki' },
      { key: 'orderNo', label: 'Nr zlecenia' },
      { key: 'client', label: 'Klient' },
      { key: 'contactName', label: 'Osoba kontaktowa' },
      { key: 'contactPhone', label: 'Telefon' },
      { key: 'contactEmail', label: 'E-mail' },
      { key: 'item', label: 'Przedmiot badań' },
      { key: 'qty', label: 'Ilość próbek' },
      { key: 'deliveryParams', label: 'Parametry dostawy' },
      { key: 'etaPickup', label: 'Przewidywana data odbioru' },
      { key: 'pickedUp', label: 'Odebrane' },
      { key: 'pickedUpAt', label: 'Data odbioru' },
      { key: 'id', label: 'ID' },
    ]
  }

  if (view === VIEW_ARCH_DELIVERED) {
    return [
      { key: 'orderNo', label: 'Nr zlecenia' },
      { key: 'client', label: 'Klient' },
      { key: 'contactName', label: 'Osoba kontaktowa' },
      { key: 'contactPhone', label: 'Telefon' },
      { key: 'contactEmail', label: 'E-mail' },
      { key: 'item', label: 'Przedmiot badań' },
      { key: 'qty', label: 'Ilość próbek' },
      { key: 'scope', label: 'Zakres badań' },
      { key: 'deliveredAt', label: 'Data dostawy' },
      { key: 'comment', label: 'Uwagi' },
      { key: 'id', label: 'ID' },
    ]
  }

  // VIEW_ARCH_PICKEDUP
  return [
    { key: 'sampleNo', label: 'Nr próbki' },
    { key: 'orderNo', label: 'Nr zlecenia' },
    { key: 'client', label: 'Klient' },
    { key: 'contactName', label: 'Osoba kontaktowa' },
    { key: 'contactPhone', label: 'Telefon' },
    { key: 'contactEmail', label: 'E-mail' },
    { key: 'item', label: 'Przedmiot badań' },
    { key: 'qty', label: 'Ilość próbek' },
    { key: 'deliveryParams', label: 'Parametry dostawy' },
    { key: 'pickedUpAt', label: 'Data odbioru' },
    { key: 'id', label: 'ID' },
  ]
}

// ───────────────────────────────────────────────────────────
// Kolumny – Table jest renderowane w PAGE (col.render(row))
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

  const contactCell = (row) => (
    <div style={{ display: 'grid' }}>
      <span>{row.contactName}</span>
      <span>{row.contactPhone}</span>
      {row.contactEmail ? <a href={`mailto:${row.contactEmail}`}>{row.contactEmail}</a> : null}
    </div>
  )

  // helpers dla "WSZYSTKIE"
  const isPickup = (row) => String(row?.id || '').startsWith('PCK-') || !!row.sampleNo || 'etaPickup' in (row || {})
  const typeLabel = (row) => (isPickup(row) ? 'Odbiór' : 'Dostawa')
  const etaValue = (row) => (isPickup(row) ? row.etaPickup : row.etaDelivery)
  const doneValue = (row) => (isPickup(row) ? !!row.pickedUp : !!row.delivered)
  const doneAtValue = (row) => (isPickup(row) ? row.pickedUpAt : row.deliveredAt)

  const PRE_COLS = [
    {
      key: 'orderNo',
      label: 'Nr zlecenia',
      sortable: true,
      type: 'string',
      width: 160,
      render: (row) =>
        row.orderNo ? (
          <LinkCmp to={`/sprzedaz/rejestr-zlecen?order=${encodeURIComponent(row.orderNo)}`}>{row.orderNo}</LinkCmp>
        ) : (
          '—'
        ),
    },
    {
      key: 'client',
      label: 'Klient',
      sortable: true,
      type: 'string',
      minWidth: 220,
      render: (row) =>
        row.client ? <LinkCmp to={`/sprzedaz/klienci/${encodeURIComponent(row.client)}`}>{row.client}</LinkCmp> : '—',
    },
    { key: 'contact', label: 'Osoba kontaktowa', sortable: false, type: 'string', minWidth: 220, render: contactCell },
    {
      key: 'item',
      label: 'Przedmiot badań',
      sortable: true,
      type: 'string',
      minWidth: 240,
      render: (row) => <span title={row.item}>{row.item || '—'}</span>,
    },
    { key: 'qty', label: 'Ilość próbek', sortable: true, type: 'number', width: 120, align: 'right' },
    {
      key: 'scope',
      label: 'Zakres badań',
      sortable: true,
      type: 'string',
      minWidth: 240,
      render: (row) =>
        row.scope ? (
          <LinkCmp to={`/metody-badawcze/spis?q=${encodeURIComponent(row.scope)}`} title={row.scope}>
            {row.scope}
          </LinkCmp>
        ) : (
          '—'
        ),
    },
    { key: 'etaDelivery', label: 'Przew. data dostawy', sortable: true, type: 'date', width: 160, align: 'center' },
    {
      key: 'delivered',
      label: 'Dostarczone',
      sortable: false,
      type: 'boolean',
      width: 120,
      align: 'center',
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
    { key: 'comment', label: 'Uwagi', sortable: false, type: 'string', minWidth: 200, render: (row) => row.comment || '—' },
  ]

  const PICKUP_COLS = [
    {
      key: 'sampleNo',
      label: 'Nr próbki',
      sortable: true,
      type: 'string',
      width: 160,
      render: (row) =>
        row.sampleNo ? (
          <LinkCmp to={`/probki/rejestr-probek?sample=${encodeURIComponent(row.sampleNo)}`}>{row.sampleNo}</LinkCmp>
        ) : (
          '—'
        ),
    },
    {
      key: 'orderNo',
      label: 'Nr zlecenia',
      sortable: true,
      type: 'string',
      width: 160,
      render: (row) =>
        row.orderNo ? (
          <LinkCmp to={`/sprzedaz/rejestr-zlecen?order=${encodeURIComponent(row.orderNo)}`}>{row.orderNo}</LinkCmp>
        ) : (
          '—'
        ),
    },
    {
      key: 'client',
      label: 'Klient',
      sortable: true,
      type: 'string',
      minWidth: 220,
      render: (row) =>
        row.client ? <LinkCmp to={`/sprzedaz/klienci/${encodeURIComponent(row.client)}`}>{row.client}</LinkCmp> : '—',
    },
    { key: 'contact', label: 'Osoba kontaktowa', sortable: false, type: 'string', minWidth: 220, render: contactCell },
    { key: 'item', label: 'Przedmiot badań', sortable: true, type: 'string', minWidth: 240, render: (row) => row.item || '—' },
    { key: 'qty', label: 'Ilość próbek', sortable: true, type: 'number', width: 120, align: 'right' },
    { key: 'deliveryParams', label: 'Parametry dostawy', sortable: false, type: 'string', minWidth: 240, render: (row) => row.deliveryParams || '—' },
    { key: 'etaPickup', label: 'Przew. data odbioru', sortable: true, type: 'date', width: 170, align: 'center' },
    {
      key: 'pickedUp',
      label: 'Odebrane',
      sortable: false,
      type: 'boolean',
      width: 120,
      align: 'center',
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
    ...PRE_COLS.filter((c) => c.key !== 'delivered'),
    {
      key: 'deliveredAt',
      label: 'Data dostawy',
      sortable: true,
      type: 'date',
      width: 150,
      align: 'center',
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
      label: 'W arch.',
      sortable: false,
      type: 'boolean',
      width: 90,
      align: 'center',
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
  ]

  const ARCH_PICKEDUP_COLS = [
    ...PICKUP_COLS.filter((c) => c.key !== 'pickedUp'),
    {
      key: 'pickedUpAt',
      label: 'Data odbioru',
      sortable: true,
      type: 'date',
      width: 150,
      align: 'center',
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
      label: 'W arch.',
      sortable: false,
      type: 'boolean',
      width: 90,
      align: 'center',
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

  const ALL_COLS = [
    {
      key: '__type',
      label: 'Typ',
      sortable: true,
      type: 'string',
      width: 110,
      render: (row) => <span title={typeLabel(row)}>{typeLabel(row)}</span>,
    },
    {
      key: 'sampleNo',
      label: 'Nr próbki',
      sortable: true,
      type: 'string',
      width: 160,
      render: (row) =>
        row.sampleNo ? (
          <LinkCmp to={`/probki/rejestr-probek?sample=${encodeURIComponent(row.sampleNo)}`}>{row.sampleNo}</LinkCmp>
        ) : (
          '—'
        ),
    },
    {
      key: 'orderNo',
      label: 'Nr zlecenia',
      sortable: true,
      type: 'string',
      width: 160,
      render: (row) =>
        row.orderNo ? (
          <LinkCmp to={`/sprzedaz/rejestr-zlecen?order=${encodeURIComponent(row.orderNo)}`}>{row.orderNo}</LinkCmp>
        ) : (
          '—'
        ),
    },
    {
      key: 'client',
      label: 'Klient',
      sortable: true,
      type: 'string',
      minWidth: 220,
      render: (row) =>
        row.client ? <LinkCmp to={`/sprzedaz/klienci/${encodeURIComponent(row.client)}`}>{row.client}</LinkCmp> : '—',
    },
    { key: 'contact', label: 'Osoba kontaktowa', sortable: false, type: 'string', minWidth: 220, render: contactCell },
    {
      key: 'item',
      label: 'Przedmiot badań',
      sortable: true,
      type: 'string',
      minWidth: 240,
      render: (row) => <span title={row.item}>{row.item || '—'}</span>,
    },
    { key: 'qty', label: 'Ilość próbek', sortable: true, type: 'number', width: 120, align: 'right' },
    {
      key: '__eta',
      label: 'ETA',
      sortable: true,
      type: 'date',
      width: 150,
      align: 'center',
      render: (row) => <span>{etaValue(row) || '—'}</span>,
    },
    {
      key: '__done',
      label: 'Wykonane',
      sortable: false,
      type: 'boolean',
      width: 120,
      align: 'center',
      render: (row) => <span>{doneValue(row) ? 'Tak' : 'Nie'}</span>,
    },
    {
      key: '__doneAt',
      label: 'Data',
      sortable: true,
      type: 'date',
      width: 140,
      align: 'center',
      render: (row) => <span>{doneAtValue(row) || '—'}</span>,
    },
  ]

  return {
    [VIEW_ALL]: ALL_COLS,
    [VIEW_PRE]: PRE_COLS,
    [VIEW_PICKUP]: PICKUP_COLS,
    [VIEW_ARCH_DELIVERED]: ARCH_DELIVERED_COLS,
    [VIEW_ARCH_PICKEDUP]: ARCH_PICKEDUP_COLS,
  }
}