import React, { useMemo } from 'react'
import { Plus } from 'lucide-react'

/**
 * Formularz POST/ZADANIE korzystający z „blue underline” (form-modal.css).
 * Używa klas:
 * .m-form, .m-field, .m-label, .m-input/.m-select/.m-textarea,
 * .checkbox-group, .m-choice, .m-actions--footer, .m-btn,
 * + m-icon-btn dla ikon.
 */
export default function PostTaskForm({
  value,
  onChange,
  onSubmit,
  onCancel,
  availableTags = [],
  setAvailableTags,
  customTag = '',
  setCustomTag,
  users = [],
  disabled = false,
}) {
  const v = value || {}
  const isTask = v.type === 'task'

  // === defensywna normalizacja ===
  const mentions = Array.isArray(v.mentions) ? v.mentions : []
  const tags = Array.isArray(v.tags) ? v.tags : []

  const canAddCustom = useMemo(
    () => !!customTag && !availableTags.includes(customTag),
    [customTag, availableTags],
  )

  return (
    <form
      className="m-form"
      onSubmit={(e) => {
        e.preventDefault()
        if (disabled) return
        onSubmit?.()
      }}
    >
      {/* ================== PODSTAWOWE INFORMACJE ================== */}
      <div className="m-section">
        <h4 className="m-section__title">Podstawowe informacje</h4>

        <div className="m-row">
          {/* Typ */}
          <div className="m-field">
            <label className="m-label">Typ</label>
            <select
              className="m-select"
              value={v.type || 'post'}
              disabled={disabled}
              onChange={(e) => onChange?.({ type: e.target.value })}
            >
              <option value="post">Post</option>
              <option value="task">Zadanie</option>
            </select>
          </div>

          {/* Dzień (target) */}
          <div className="m-field">
            <label className="m-label">Dzień</label>
            <input
              type="date"
              className="m-input"
              value={v.targetDate || ''}
              disabled={disabled}
              onChange={(e) => onChange?.({ targetDate: e.target.value })}
              required
            />
          </div>
        </div>

        {/* Tytuł */}
        <div className="m-field">
          <label className="m-label">Tytuł</label>
          <input
            type="text"
            className="m-input"
            value={v.title || ''}
            disabled={disabled}
            onChange={(e) => onChange?.({ title: e.target.value })}
            placeholder={
              isTask ? 'Np. Przygotować salę do audytu' : 'Np. Nowy grafik'
            }
            required
          />
        </div>

        {/* Treść */}
        <div className="m-field">
          <label className="m-label">Treść</label>
          <textarea
            className="m-textarea"
            rows={5}
            value={v.content || ''}
            disabled={disabled}
            onChange={(e) => onChange?.({ content: e.target.value })}
            placeholder={isTask ? 'Opis zadania…' : 'Treść posta…'}
          />
        </div>

        {/* Priorytet (tylko zadania) */}
        {isTask && (
          <div className="m-field">
            <label className="m-label">Priorytet</label>
            <select
              className="m-select"
              value={v.priority || 'normalny'}
              disabled={disabled}
              onChange={(e) => onChange?.({ priority: e.target.value })}
            >
              <option value="wysoki">Wysoki</option>
              <option value="normalny">Normalny</option>
              <option value="niski">Niski</option>
            </select>
          </div>
        )}
      </div>

      {/* ================== WZMIANKI ================== */}
      <div className="m-section">
        <h4 className="m-section__title">Wzmianki</h4>

        <div className="checkbox-group">
          {/* @wszyscy */}
          <label className="m-choice">
            <input
              type="checkbox"
              disabled={disabled}
              checked={mentions.includes('wszyscy')}
              onChange={(e) => {
                if (disabled) return
                onChange?.({
                  mentions: e.target.checked
                    ? ['wszyscy']
                    : mentions.filter((m) => m !== 'wszyscy'),
                })
              }}
            />
            <span>@wszyscy</span>
          </label>

          {users.map((u) => {
            const checked = mentions.includes(u)
            const disabledUser =
              disabled || (mentions.includes('wszyscy') && !checked)

            return (
              <label
                key={u}
                className="m-choice"
                style={disabledUser ? { opacity: 0.55 } : undefined}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  disabled={disabledUser}
                  onChange={(e) => {
                    if (disabled) return
                    const list = new Set(mentions)
                    if (e.target.checked) {
                      list.add(u)
                      list.delete('wszyscy')
                    } else {
                      list.delete(u)
                    }
                    onChange?.({ mentions: Array.from(list) })
                  }}
                />
                <span>@{u}</span>
              </label>
            )
          })}
        </div>

        <p className="m-help">
          Zaznaczenie @wszyscy wyłącza indywidualne wzmianki.
        </p>
      </div>

      {/* ================== TAGI ================== */}
      <div className="m-section">
        <h4 className="m-section__title">Tagi</h4>

        <div className="checkbox-group" style={{ marginBottom: 8 }}>
          {availableTags.map((t) => {
            const checked = tags.includes(t)
            return (
              <label key={t} className="m-choice">
                <input
                  type="checkbox"
                  checked={checked}
                  disabled={disabled}
                  onChange={(e) => {
                    if (disabled) return
                    const list = new Set(tags)
                    if (e.target.checked) list.add(t)
                    else list.delete(t)
                    onChange?.({ tags: Array.from(list) })
                  }}
                />
                <span>#{t}</span>
              </label>
            )
          })}
        </div>

        <div className="m-row">
          <div className="m-field">
            <label className="m-label">Nowy tag</label>
            <input
              className="m-input"
              type="text"
              placeholder="Dodaj nowy tag…"
              value={customTag}
              disabled={disabled}
              onChange={(e) => setCustomTag?.(e.target.value.trimStart())}
            />
            <p className="m-help">
              Tagi pomagają filtrować wpisy (np. #grafik, #audyt).
            </p>
          </div>

          {/* Plus */}
          <div className="m-field" style={{ alignItems: 'flex-end' }}>
            <button
              type="button"
              className="m-icon-btn m-icon-btn--accent m-icon-btn--square"
              disabled={disabled || !canAddCustom}
              onClick={() => {
                if (disabled || !canAddCustom) return
                setAvailableTags?.((prev) => [...(prev || []), customTag])
                onChange?.({
                  tags: Array.from(new Set([...tags, customTag])),
                })
                setCustomTag?.('')
              }}
              aria-label="Dodaj tag"
              title="Dodaj tag"
            >
              <Plus size={18} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      {/* ================== AKCJE ================== */}
      <div className="m-actions--footer" style={{ display: 'flex' }}>
        <button
          type="button"
          className="m-btn m-btn--secondary"
          onClick={onCancel}
          disabled={disabled}
        >
          Anuluj
        </button>

        <button
          type="submit"
          className="m-btn m-btn--primary"
          disabled={disabled}
        >
          Zapisz
        </button>
      </div>
    </form>
  )
}
