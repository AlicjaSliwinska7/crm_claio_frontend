const toStr = v => (v ?? '').toString()

export const joinServices = (arr) =>
  (arr && arr.length ? arr.filter(Boolean).join(', ') : '—')

export function buildCalibrationLabColumns() {
  return [
    { key: 'name',          label: 'Nazwa',             sortable: true,  type: 'string' },
    { key: 'city',          label: 'Miasto',            sortable: true,  type: 'string' },
    { key: 'address',       label: 'Adres',             sortable: false },
    { key: 'contactPerson', label: 'Osoba kontaktowa',  sortable: false },
    { key: 'email',         label: 'E-mail',            sortable: false,
      render: r => (r.email ? `<a href="mailto:${r.email}">${r.email}</a>` : '—') },
    { key: 'phone',         label: 'Telefon',           sortable: false },
    { key: 'services',      label: 'Usługi',            sortable: false,
      render: r => joinServices(r.services) },
  ]
}
