// src/shared/tables/components/cells/StatusCell.jsx
import React, { memo } from 'react'
import PropTypes from 'prop-types'

const normalizeKey = (v) =>
  String(v ?? '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')

const STATUS_UI = {
  // ── Appointments ──────────────────────────────────────────────
  planowane: {
    label: 'Planowane',
    icon: 'fa-hourglass-start',
    className: 'status--slate',
  },
  wtrakcie: {
    label: 'W trakcie',
    icon: 'fa-spinner',
    spin: true,
    className: 'status--blue',
  },
  zakonczone: {
    label: 'Zakończone',
    icon: 'fa-check',
    className: 'status--green',
  },
  odwolane: {
    label: 'Odwołane',
    icon: 'fa-x',
    className: 'status--red',
  },

  // ── Offers ────────────────────────────────────────────────────
  wprzygotowaniu: {
    label: 'W przygotowaniu',
    icon: 'fa-pen-to-square',
    className: 'status--slate',
  },
  wyslana: {
    label: 'Wysłana',
    icon: 'fa-paper-plane',
    className: 'status--blue',
  },
  przyjeta: {
    label: 'Przyjęta',
    icon: 'fa-circle-check',
    className: 'status--green',
  },
  odrzucona: {
    label: 'Odrzucona',
    icon: 'fa-circle-xmark',
    className: 'status--red',
  },

  // ── Orders ────────────────────────────────────────────────────
  zarejestrowane: {
    label: 'Zarejestrowane',
    icon: 'fa-clipboard-check',
    className: 'status--slate',
  },
  // uwaga: "w toku" -> normalizeKey => "wtoku"
  wtoku: {
    label: 'W toku',
    icon: 'fa-spinner',
    spin: true,
    className: 'status--blue',
  },
  sprawozdanie: {
    label: 'Sprawozdanie',
    icon: 'fa-file-lines',
    className: 'status--green',
  },
}

function StatusCell({ row, col, value }) {
  const raw =
    value !== undefined
      ? value
      : typeof col?.getStatus === 'function'
        ? col.getStatus(row)
        : row?.[col?.key]

  const key = normalizeKey(raw)
  const def = STATUS_UI[key]

  const label = def?.label ?? String(raw ?? '—')
  const tdClass = ['td--status', col?.className].filter(Boolean).join(' ')
  const dataAlign = col?.align ? { 'data-align': col.align } : {}

  const title =
    (typeof col?.titleAccessor === 'function' && col.titleAccessor(row)) ||
    label

  // Stabilne id dla aria-describedby (unikalne per wiersz + kolumna)
  const describedById = `status-${String(row?.id ?? '').replace(/\s+/g, '-')}-${col?.key || 'status'}`

  return (
    <td
      className={tdClass}
      {...dataAlign}
      title={title}
      role="gridcell"
      aria-label={`Status: ${label}`}
      aria-describedby={describedById}
    >
      {/* sr-only: pełna informacja dla czytników (ikona jest aria-hidden) */}
      <span id={describedById} className="sr-only">
        Status: {label}
      </span>

      {/* Wizualny status */}
      <span
        className={`status-text ${def?.className ?? 'status--default'}`}
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {def?.icon && (
          <i
            className={`fa-solid ${def.icon} ${def.spin ? 'fa-spin' : ''} status-icon`}
            aria-hidden="true"
          />
        )}
        <span className="status-label" aria-hidden="true">
          {label}
        </span>
      </span>
    </td>
  )
}

StatusCell.propTypes = {
  row: PropTypes.object.isRequired,
  col: PropTypes.shape({
    key: PropTypes.string,
    align: PropTypes.oneOf(['left', 'center', 'right']),
    className: PropTypes.string,
    getStatus: PropTypes.func,
    titleAccessor: PropTypes.func,
  }).isRequired,
  value: PropTypes.any,
}

export default memo(StatusCell)