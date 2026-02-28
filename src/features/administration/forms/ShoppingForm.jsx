// src/features/administration/forms/ShoppingForm.jsx
import React, { useCallback, useMemo } from 'react'
import { CATEGORIES, STATUSES } from '../config/shopping.config'

export default function ShoppingForm({ draft, setDraft, onSubmit, onClose }) {
  const d = draft || {}

  const categories = useMemo(() => CATEGORIES ?? [], [])
  const statuses = useMemo(() => STATUSES ?? [], [])

  const update = useCallback(
    (patch) => setDraft((prev) => ({ ...(prev || {}), ...patch })),
    [setDraft]
  )

  const onText = useCallback(
    (e) => update({ [e.target.name]: e.target.value }),
    [update]
  )

  const onSelect = useCallback(
    (e) => update({ [e.target.name]: e.target.value }),
    [update]
  )

  const onQty = useCallback(
    (e) => {
      const raw = e.target.value
      if (raw === '') return update({ quantity: '' })
      const n = parseInt(raw, 10)
      update({ quantity: Number.isFinite(n) ? n : 1 })
    },
    [update]
  )

  return (
    <form className="m-form" onSubmit={onSubmit} autoComplete="off">
      {/* ===== Nazwa ===== */}
      <div className="m-field">
        <label className="m-label" htmlFor="shopping-name">
          Nazwa <span className="req">*</span>
        </label>
        <input
          id="shopping-name"
          name="name"
          className="m-input"
          type="text"
          value={d.name || ''}
          onChange={onText}
          placeholder="np. rękawiczki nitrylowe, papier A4…"
          required
        />
        <div className="m-help">Wpisz nazwę produktu/usługi do kupienia.</div>
      </div>

      {/* ===== Kategoria + Ilość ===== */}
      <div className="m-row">
        <div className="m-field">
          <label className="m-label" htmlFor="shopping-category">
            Kategoria
          </label>
          <select
            id="shopping-category"
            name="category"
            className="m-select"
            value={d.category || 'biuro'}
            onChange={onSelect}
          >
            {categories.map((c) => (
              <option key={c.key} value={c.key}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <div className="m-field">
          <label className="m-label" htmlFor="shopping-quantity">
            Ilość
          </label>
          <input
            id="shopping-quantity"
            name="quantity"
            className="m-input"
            type="number"
            min={1}
            step={1}
            inputMode="numeric"
            value={d.quantity ?? 1}
            onChange={onQty}
          />
        </div>
      </div>

      {/* ===== Link ===== */}
      <div className="m-field">
        <label className="m-label" htmlFor="shopping-link">
          Link
        </label>
        <input
          id="shopping-link"
          name="link"
          className="m-input"
          type="url"
          value={d.link || ''}
          onChange={onText}
          placeholder="https://… (opcjonalnie)"
        />
        <div className="m-help">Możesz wkleić link do produktu/oferty.</div>
      </div>

      {/* ===== Status + Dodał(a) ===== */}
      <div className="m-row">
        <div className="m-field">
          <label className="m-label" htmlFor="shopping-status">
            Status
          </label>
          <select
            id="shopping-status"
            name="status"
            className="m-select"
            value={d.status || 'todo'}
            onChange={onSelect}
          >
            {statuses.map((s) => (
              <option key={s.key} value={s.key}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        <div className="m-field">
          <label className="m-label" htmlFor="shopping-addedBy">
            Dodał(a)
          </label>
          <input
            id="shopping-addedBy"
            name="addedBy"
            className="m-input"
            type="text"
            value={d.addedBy || ''}
            onChange={onText}
            placeholder="np. Alicja Śliwińska"
          />
        </div>
      </div>

      {/* ===== Notatka ===== */}
      <div className="m-field">
        <label className="m-label" htmlFor="shopping-note">
          Notatka
        </label>
        <textarea
          id="shopping-note"
          name="note"
          className="m-textarea"
          value={d.note || ''}
          onChange={onText}
          placeholder="np. parametry, marka, pilność…"
          rows={4}
        />
        <div className="m-help">Opcjonalne szczegóły dla osoby zamawiającej.</div>
      </div>

      {/* ===== Akcje ===== */}
      <div className="m-actions--footer">
        <button type="button" className="m-btn m-btn--secondary" onClick={onClose}>
          Anuluj
        </button>
        <button type="submit" className="m-btn m-btn--primary">
          Zapisz
        </button>
      </div>
    </form>
  )
}