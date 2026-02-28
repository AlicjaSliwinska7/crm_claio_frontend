import React from 'react'
import PropTypes from 'prop-types'
import { Search } from 'lucide-react'
import clsx from 'clsx'

function NativeSelect({ value, onChange, options = [], className = '', placeholder }) {
  return (
    <select
      className={clsx('es-select', className)}
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
    >
      {placeholder ? <option value="">{placeholder}</option> : null}
      {options.map((o) => (
        <option key={String(o.value)} value={o.value} disabled={o.disabled}>
          {o.label}
        </option>
      ))}
    </select>
  )
}

export default function SummaryControlsRenderer({ controls = [], components = {} }) {
  const SelectCmp = components.Select || NativeSelect

  return (
    <div className="es-panel-controls">
      {controls.map((c) => {
        if (!c) return null

        if (c.type === 'custom') {
          return (
            <div key={c.key} className="es-col">
              {c.render?.()}
            </div>
          )
        }

        if (c.type === 'button') {
          return (
            <div key={c.key} className={clsx('es-col', 'es-col--actions')}>
              <button
                type="button"
                className={c.kind === 'icon' ? 'tss-icon-btn tss-btn--icon' : 'tss-btn'}
                onClick={c.onClick}
                disabled={c.disabled}
                title={c.title || c.label}
                aria-label={c.title || c.label}
              >
                {c.kind === 'icon' ? c.icon : c.label}
              </button>
            </div>
          )
        }

        if (c.type === 'toggle') {
          return (
            <div key={c.key} className="es-col">
              <label className="es-label">{c.label}</label>
              <label style={{ display: 'inline-flex', gap: 8, alignItems: 'center', height: 36 }}>
                <input
                  type="checkbox"
                  checked={!!c.checked}
                  onChange={(e) => c.onChange?.(e.target.checked)}
                />
                <span className="muted">{c.checked ? 'Tak' : 'Nie'}</span>
              </label>
            </div>
          )
        }

        if (c.type === 'daterange') {
          return (
            <React.Fragment key={c.key}>
              <div className="es-col">
                <label className="es-label">{c.fromLabel || 'Od'}</label>
                <input
                  type="date"
                  className="tss-input tss-input--date"
                  value={c.from || ''}
                  onChange={(e) => c.setFrom?.(e.target.value)}
                />
              </div>
              <div className="es-col">
                <label className="es-label">{c.toLabel || 'Do'}</label>
                <input
                  type="date"
                  className="tss-input tss-input--date"
                  value={c.to || ''}
                  onChange={(e) => c.setTo?.(e.target.value)}
                />
              </div>
            </React.Fragment>
          )
        }

        if (c.type === 'date') {
          return (
            <div key={c.key} className="es-col">
              <label className="es-label">{c.label}</label>
              <input
                type="date"
                className="tss-input tss-input--date"
                value={c.value || ''}
                onChange={(e) => c.onChange?.(e.target.value)}
              />
            </div>
          )
        }

        if (c.type === 'search') {
          const icon = c.icon ?? <Search size={16} />
          return (
            <div key={c.key} className="es-col" style={c.width ? { minWidth: c.width } : undefined}>
              <label className="es-label">{c.label}</label>
              <div className="tss-search">
                <div className={clsx('tss-search__box', c.limitClassName)}>
                  <span className="tss-search__icon" aria-hidden="true">{icon}</span>
                  <input
                    className="tss-input tss-input--search"
                    value={c.value || ''}
                    placeholder={c.placeholder || ''}
                    onChange={(e) => c.onChange?.(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )
        }

        if (c.type === 'text') {
          return (
            <div key={c.key} className="es-col" style={c.width ? { minWidth: c.width } : undefined}>
              <label className="es-label">{c.label}</label>
              <input
                className="tss-input"
                value={c.value || ''}
                placeholder={c.placeholder || ''}
                onChange={(e) => c.onChange?.(e.target.value)}
              />
            </div>
          )
        }

        if (c.type === 'select') {
          return (
            <div key={c.key} className="es-col" style={c.width ? { minWidth: c.width } : undefined}>
              <label className="es-label">{c.label}</label>
              <SelectCmp
                value={c.value}
                onChange={c.onChange}
                options={c.options}
                placeholder={c.placeholder}
              />
            </div>
          )
        }

        if (c.type === 'multiselect') {
          return (
            <div key={c.key} className="es-col" style={c.width ? { minWidth: c.width } : undefined}>
              <label className="es-label">{c.label}</label>
              <select
                className="es-select"
                multiple
                value={Array.isArray(c.value) ? c.value : []}
                onChange={(e) => {
                  const vals = Array.from(e.target.selectedOptions).map((o) => o.value)
                  c.onChange?.(vals)
                }}
              >
                {(c.options || []).map((o) => (
                  <option key={String(o.value)} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          )
        }

        return null
      })}
    </div>
  )
}

SummaryControlsRenderer.propTypes = {
  controls: PropTypes.array,
  components: PropTypes.shape({
    Select: PropTypes.any,
  }),
}