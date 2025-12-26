// src/features/equipment/components/EquipmentForm.jsx
import React, { useMemo, useId } from 'react'
import { STATUS_DEFS } from '../config/equipments.config'

const EMPTY_ITEM = {
  id: '',
  name: '',
  code: '',
  status: 'sprawny',
  location: '',
  group: '',
  model: '',
  producer: '',
  purchaseDate: '',
  purchaseCost: '',
}

export default function EquipmentForm({
  item = EMPTY_ITEM,
  setItem,
  onSubmit,
  onClose,
}) {
  const uid = useId()

  const model = useMemo(() => ({
    ...EMPTY_ITEM,
    ...(item || {}),
  }), [item])

  const safeSet = typeof setItem === 'function' ? setItem : () => {}
  const safeSubmit = typeof onSubmit === 'function' ? onSubmit : e => e.preventDefault()
  const safeClose = typeof onClose === 'function' ? onClose : () => {}

  const idFor = (name) => `${uid}_${name}`

  const handleChange = (e) => {
    const { name, value } = e.target
    safeSet(prev => ({ ...(prev || EMPTY_ITEM), [name]: value ?? '' }))
  }

  return (
    <form onSubmit={safeSubmit} className="m-form" noValidate>
      <section className="m-section">
        <h6 className="m-section__title">Dane podstawowe</h6>

        <div className="m-row">
          <div className="m-field">
            <label className="m-label" htmlFor={idFor('id')}>ID *</label>
            <input
              id={idFor('id')}
              name="id"
              className="m-input"
              value={model.id}
              onChange={handleChange}
              required
            />
          </div>

          <div className="m-field">
            <label className="m-label" htmlFor={idFor('code')}>Kod</label>
            <input
              id={idFor('code')}
              name="code"
              className="m-input"
              value={model.code}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="m-field">
          <label className="m-label" htmlFor={idFor('name')}>Nazwa *</label>
          <input
            id={idFor('name')}
            name="name"
            className="m-input"
            value={model.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="m-row">
          <div className="m-field">
            <label className="m-label" htmlFor={idFor('status')}>Status</label>
            <select
              id={idFor('status')}
              name="status"
              className="m-select"
              value={model.status}
              onChange={handleChange}
            >
              {STATUS_DEFS.map(s => (
                <option key={s.key} value={s.key}>{s.label}</option>
              ))}
            </select>
          </div>

          <div className="m-field">
            <label className="m-label" htmlFor={idFor('location')}>Lokalizacja</label>
            <input
              id={idFor('location')}
              name="location"
              className="m-input"
              value={model.location}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="m-row">
          <div className="m-field">
            <label className="m-label" htmlFor={idFor('group')}>Grupa</label>
            <input
              id={idFor('group')}
              name="group"
              className="m-input"
              value={model.group}
              onChange={handleChange}
            />
          </div>

          <div className="m-field">
            <label className="m-label" htmlFor={idFor('producer')}>Producent</label>
            <input
              id={idFor('producer')}
              name="producer"
              className="m-input"
              value={model.producer}
              onChange={handleChange}
            />
          </div>
        </div>
      </section>

      <div className="m-actions m-actions--footer">
        <button type="button" className="m-btn m-btn--secondary" onClick={safeClose}>
          Anuluj
        </button>
        <button type="submit" className="m-btn m-btn--primary">
          Zapisz
        </button>
      </div>
    </form>
  )
}
