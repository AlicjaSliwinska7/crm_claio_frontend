// src/features/equipment/forms/CalibrationLabForm.jsx
import React, { useMemo, useState, useId, useCallback } from 'react'
import { Plus } from 'lucide-react'

const EMPTY_LAB = {
  id: '',
  name: '',
  city: '',
  address: '',
  contactPerson: '',
  email: '',
  phone: '',
  // pola zgodne z listą/configiem:
  scope: '',
  accreditation: '',
  // pola pomocnicze UI:
  services: [],
  notes: '',
}

function normalizeServices(s) {
  if (Array.isArray(s)) return s.map((x) => String(x || '').trim()).filter(Boolean)
  if (typeof s === 'string') {
    return s
      .split(/[;,]/)
      .map((x) => x.trim())
      .filter(Boolean)
  }
  return []
}

function servicesToScope(services) {
  const arr = normalizeServices(services)
  return arr.join(', ')
}

export default function CalibrationLabForm({
  lab = EMPTY_LAB,
  setLab = () => {},
  onSubmit = (e) => e.preventDefault(),
  onClose = () => {},
  knownServices = [],
}) {
  const uid = useId()
  const idFor = useCallback((name) => `clab_${name}__${uid}`, [uid])

  const model = useMemo(() => {
    const v = lab || {}
    const services = normalizeServices(v.services)
    const fromScope = !services.length ? normalizeServices(v.scope) : services

    return {
      id: String(v.id ?? ''),
      name: String(v.name ?? ''),
      city: String(v.city ?? ''),
      address: String(v.address ?? ''),
      contactPerson: String(v.contactPerson ?? ''),
      email: String(v.email ?? ''),
      phone: String(v.phone ?? ''),
      accreditation: String(v.accreditation ?? ''),
      services: fromScope,
      notes: String(v.notes ?? ''),
      scope: String(v.scope ?? servicesToScope(fromScope)),
    }
  }, [lab])

  const safeSet = typeof setLab === 'function' ? setLab : () => {}
  const safeOnSubmit = typeof onSubmit === 'function' ? onSubmit : (e) => e.preventDefault()
  const safeOnClose = typeof onClose === 'function' ? onClose : () => {}
  const servicesList = Array.isArray(knownServices) ? knownServices : []

  const [newService, setNewService] = useState('')

  const handleInputChange = (e) => {
    const { name, value } = e.target || {}
    if (!name) return
    safeSet((prev) => {
      const p = prev && typeof prev === 'object' ? prev : EMPTY_LAB
      return { ...p, [name]: value ?? '' }
    })
  }

  const toggleService = (svc) => {
    safeSet((prev) => {
      const p = prev && typeof prev === 'object' ? prev : EMPTY_LAB
      const current = normalizeServices(p.services)
      const next = current.includes(svc) ? current.filter((x) => x !== svc) : current.concat(svc)
      return { ...p, services: next, scope: servicesToScope(next) }
    })
  }

  const canAddCustom = useMemo(() => {
    const s = newService.trim()
    if (!s) return false
    const current = normalizeServices(model.services)
    return !current.some((x) => x.toLowerCase() === s.toLowerCase())
  }, [newService, model.services])

  const addCustomService = useCallback(() => {
    const s = newService.trim()
    if (!s) return
    safeSet((prev) => {
      const p = prev && typeof prev === 'object' ? prev : EMPTY_LAB
      const current = normalizeServices(p.services)
      if (current.some((x) => x.toLowerCase() === s.toLowerCase())) return p
      const next = current.concat(s)
      return { ...p, services: next, scope: servicesToScope(next) }
    })
    setNewService('')
  }, [newService, safeSet])

  return (
    <form onSubmit={safeOnSubmit} className="m-form modal-form" noValidate>
      <section className="m-section" aria-labelledby={idFor('section_main')}>
        <h6 id={idFor('section_main')} className="m-section__title">
          Dane laboratorium
        </h6>

        <div className="m-field">
          <label className="m-label" htmlFor={idFor('name')}>
            Nazwa <span aria-hidden="true">*</span>
          </label>
          <input
            id={idFor('name')}
            name="name"
            placeholder="np. Instytut Metrologii"
            value={model.name}
            onChange={handleInputChange}
            required
            className="m-input"
            autoComplete="off"
          />
        </div>

        <div className="m-field">
          <label className="m-label" htmlFor={idFor('city')}>
            Miasto i adres
          </label>
          <div className="m-row">
            <input
              id={idFor('city')}
              name="city"
              placeholder="np. Warszawa"
              value={model.city}
              onChange={handleInputChange}
              className="m-input"
              autoComplete="off"
            />
            <input
              id={idFor('address')}
              name="address"
              placeholder="ulica i numer"
              value={model.address}
              onChange={handleInputChange}
              className="m-input"
              autoComplete="off"
            />
          </div>
        </div>

        <div className="m-field">
          <label className="m-label" htmlFor={idFor('contactPerson')}>
            Osoba kontaktowa
          </label>
          <input
            id={idFor('contactPerson')}
            name="contactPerson"
            placeholder="np. Jan Kowalski"
            value={model.contactPerson}
            onChange={handleInputChange}
            className="m-input"
            autoComplete="off"
          />
        </div>

        <div className="m-field">
          <label className="m-label" htmlFor={idFor('email')}>
            E-mail i telefon
          </label>
          <div className="m-row">
            <input
              id={idFor('email')}
              type="email"
              name="email"
              placeholder="np. kontakt@lab.pl"
              value={model.email}
              onChange={handleInputChange}
              className="m-input"
              autoComplete="off"
            />
            <input
              id={idFor('phone')}
              type="tel"
              name="phone"
              placeholder="np. +48 22 555 66 77"
              value={model.phone}
              onChange={handleInputChange}
              className="m-input"
              autoComplete="off"
            />
          </div>
        </div>

        <div className="m-field">
          <label className="m-label" htmlFor={idFor('accreditation')}>
            Akredytacja
          </label>
          <input
            id={idFor('accreditation')}
            name="accreditation"
            placeholder="np. PCA AB-123"
            value={model.accreditation}
            onChange={handleInputChange}
            className="m-input"
            autoComplete="off"
          />
        </div>
      </section>

      <section className="m-section" aria-labelledby={idFor('section_services')}>
        <h6 id={idFor('section_services')} className="m-section__title">
          Zakres usług
        </h6>

        {servicesList.length > 0 && (
          <fieldset className="m-field">
            <legend className="m-label">Wybierz usługi</legend>
            <div className="checkbox-group">
              {servicesList.map((s) => (
                <label key={s} className="m-choice">
                  <input
                    type="checkbox"
                    checked={model.services.includes(s)}
                    onChange={() => toggleService(s)}
                  />
                  {s}
                </label>
              ))}
            </div>
            <div className="m-help">Możesz też dodać własną pozycję poniżej.</div>
          </fieldset>
        )}

        <div className="m-row m-row--end">
          <div className="m-field" style={{ flex: 1 }}>
            <label className="m-label" htmlFor={idFor('service_custom')}>
              Dodaj własną usługę
            </label>
            <input
              id={idFor('service_custom')}
              placeholder="np. długość, temperatura, ciśnienie…"
              value={newService}
              onChange={(e) => setNewService(e.target.value)}
              className="m-input"
              autoComplete="off"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  if (canAddCustom) addCustomService()
                }
              }}
            />
          </div>

          <div className="m-field m-field--icon">
            <button
              type="button"
              className="m-icon-btn m-icon-btn--accent m-icon-btn--square"
              disabled={!canAddCustom}
              onClick={addCustomService}
              aria-label="Dodaj usługę"
              title="Dodaj usługę"
            >
              <Plus size={18} aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="m-help">
          W tabeli zapisze się jako: <strong>{servicesToScope(model.services) || '—'}</strong>
        </div>
      </section>

      <section className="m-section" aria-labelledby={idFor('section_notes')}>
        <h6 id={idFor('section_notes')} className="m-section__title">
          Notatki
        </h6>
        <div className="m-field">
          <label className="m-label" htmlFor={idFor('notes')}>
            Uwagi / notatki
          </label>
          <textarea
            id={idFor('notes')}
            name="notes"
            rows={3}
            value={model.notes}
            onChange={handleInputChange}
            className="m-textarea"
            placeholder="Dodatkowe informacje…"
            autoComplete="off"
          />
          <div className="m-help">Pole opcjonalne.</div>
        </div>
      </section>

      <div className="m-actions m-actions--footer">
        <button type="button" onClick={safeOnClose} className="m-btn m-btn--secondary">
          Anuluj
        </button>
        <button type="submit" className="m-btn m-btn--primary">
          Zapisz
        </button>
      </div>
    </form>
  )
}
