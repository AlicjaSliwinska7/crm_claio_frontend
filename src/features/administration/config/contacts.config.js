// src/features/administration/config/contacts.config.js
import { col, makeSearchFields, emailRenderer, buildingRoomRenderer } from '../../../shared/tables'
import { required, email as emailRule, minLen, maxLen } from '../../../shared/utils/validators'

export const HEADER_COLS = [
  col('firstName', 'Imię', { sortable: true, type: 'string', minWidth: 140 }),
  col('lastName', 'Nazwisko', { sortable: true, type: 'string', minWidth: 160 }),
  col('department', 'Dział', { sortable: true, type: 'string', minWidth: 140 }),
  col('position', 'Stanowisko', { sortable: true, type: 'string', minWidth: 220 }),

  // wąskie kolumny → stała szerokość (żeby nie puchły)
  col('phoneInternal', 'Tel. wewn.', { width: 100, align: 'center' }),
  col('phoneExternal', 'Tel. zewn.', { width: 140, align: 'center' }),

  col('email', 'E-mail', {
    sortable: true,
    type: 'string',
    minWidth: 260,
    ...emailRenderer('email'),
  }),

  col('building', 'Budynek / Pokój', {
    sortable: true,
    type: 'string',
    minWidth: 150,
    ...buildingRoomRenderer({
      buildingKey: 'building',
      roomKey: 'room',
      separator: ' / ',
    }),
  }),
]

export const COMMON_DEPARTMENTS = [
  'Administracja',
  'Sprzedaż',
  'Produkcja',
  'Jakość',
  'Laboratorium',
  'IT',
  'HR',
  'Finanse',
  'Logistyka',
  'Zakupy',
]

export const INITIAL_DATA = [
  {
    firstName: 'Anna',
    lastName: 'Nowak',
    department: 'Administracja',
    position: 'Kierownik działu',
    phoneInternal: '101',
    phoneExternal: '123 456 789',
    email: 'a.nowak@example.com',
    building: 'A',
    room: '101',
  },
  {
    firstName: 'Piotr',
    lastName: 'Kowalski',
    department: 'Sprzedaż',
    position: 'Specjalista',
    phoneInternal: '102',
    phoneExternal: '123 456 790',
    email: 'p.kowalski@example.com',
    building: 'B',
    room: '202',
  },
]

export const CSV_COLUMNS = [
  { key: 'firstName', label: 'Imię' },
  { key: 'lastName', label: 'Nazwisko' },
  { key: 'department', label: 'Dział' },
  { key: 'position', label: 'Stanowisko' },
  { key: 'phoneInternal', label: 'Tel. wewn.' },
  { key: 'phoneExternal', label: 'Tel. zewn.' },
  { key: 'email', label: 'E-mail' },
  { key: 'building', label: 'Budynek' },
  { key: 'room', label: 'Pokój' },
]

export const labelForDelete = (row) => {
  if (!row) return ''
  const name = `${row.firstName ?? ''} ${row.lastName ?? ''}`.trim()
  const email = row.email ? ` (${row.email})` : ''
  return `${name}${email}`.trim()
}

export const normalizeOnLoad = (arr) =>
  (arr || []).map((c, i) => ({
    id: c.id || `CN-${Date.now()}-${i}`,
    ...c,
  }))

export const EMPTY_CONTACT = {
  id: '',
  firstName: '',
  lastName: '',
  department: '',
  position: '',
  phoneInternal: '',
  phoneExternal: '',
  email: '',
  building: '',
  room: '',
}

export const CONTACT_SCHEMA = {
  firstName: [required('Imię'), minLen(2, 'Imię'), maxLen(50, 'Imię')],
  lastName: [required('Nazwisko'), minLen(2, 'Nazwisko'), maxLen(60, 'Nazwisko')],
  email: [required('E-mail'), emailRule('E-mail')],
}

export const getSearchFields = makeSearchFields(
  'firstName',
  'lastName',
  'department',
  'position',
  'phoneInternal',
  'phoneExternal',
  'email',
  'building',
  'room'
)
