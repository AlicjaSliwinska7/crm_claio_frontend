// src/shared/tables/components/cells/DataCell.jsx
import React, { memo } from 'react'
import PropTypes from 'prop-types'
import StatusCell from './StatusCell'

import {
  fmtDateDMY,
  fmtDateTimeDMYHM,
  fmtDateTimeDMYHMS,
  toDateObj,
} from '../../utils/formatters/dateTime'

function DataCell({ row, col, value }) {
  const raw = value !== undefined ? value : row?.[col?.key]

  const alignClass = col?.align ? `align-${col.align}` : ''
  const dataAlign = col?.align ? { 'data-align': col.align } : {}

  const isStatus =
    Boolean(col?.isStatus) ||
    col?.type === 'status' ||
    (typeof col?.key === 'string' && col.key.toLowerCase().includes('status'))

  const isDate = col?.type === 'date'
  const isDateTime = col?.type === 'datetime'
  const isDateTimeSec = col?.type === 'datetimeSec'
  const isAnyDate = isDate || isDateTime || isDateTimeSec

  /* ======================================================
     ✅ AUTOMATYCZNE KOMPAKTOWANIE KOLUMN
     - daty, statusy, liczby → nowrap (wąskie)
     - tylko jeśli użytkownik NIE wymusił własnej klasy
     ====================================================== */
  const isNumeric =
    typeof raw === 'number' ||
    (typeof raw === 'string' && raw.length <= 8 && /^[\d\s+()-]+$/.test(raw))

  const autoNoWrap =
    (isAnyDate || isStatus || isNumeric) &&
    !col?.className &&
    col?.disableAutoNoWrap !== true
      ? 'cell-nowrap'
      : ''

  // ✅ status ma priorytet
  if (isStatus && col?.disableAutoStatus !== true) {
    return <StatusCell row={row} col={col} value={raw} />
  }

  const tdClasses = [
    alignClass,
    isStatus ? 'td--status' : '',
    isAnyDate ? 'td--date' : '',
    autoNoWrap,
    col?.className || '',
  ]
    .filter(Boolean)
    .join(' ')

  const title = col?.titleAccessor ? col.titleAccessor(row) : col?.title
  const utc = Boolean(col?.utc)

  const formatDateFromRaw = v => {
    const d = toDateObj(v)
    if (!d) return v ?? '—'
    if (isDateTimeSec) return fmtDateTimeDMYHMS(d, { utc })
    if (isDateTime) return fmtDateTimeDMYHM(d, { utc })
    return fmtDateDMY(d, { utc })
  }

  let content

  if (isAnyDate && col?.disableAutoFormat !== true) {
    content = formatDateFromRaw(raw)
  } else if (typeof col?.render === 'function') {
    content = col.render(raw, row)
  } else {
    content = raw ?? '—'
  }

  const finalContent =
    isAnyDate && (typeof content === 'string' || typeof content === 'number') ? (
      <span
        className="date-cell"
        data-type={isDateTimeSec ? 'datetimeSec' : isDateTime ? 'datetime' : 'date'}
      >
        {content}
      </span>
    ) : (
      content
    )

  return (
    <td className={tdClasses || undefined} {...dataAlign} title={title}>
      {finalContent}
    </td>
  )
}

DataCell.propTypes = {
  row: PropTypes.object.isRequired,
  col: PropTypes.shape({
    key: PropTypes.string,
    align: PropTypes.oneOf(['left', 'center', 'right']),
    className: PropTypes.string,
    title: PropTypes.string,
    titleAccessor: PropTypes.func,
    render: PropTypes.func,

    type: PropTypes.string, // date | datetime | datetimeSec | status | ...
    isStatus: PropTypes.bool,
    disableAutoStatus: PropTypes.bool,

    utc: PropTypes.bool,
    disableAutoFormat: PropTypes.bool,
    disableAutoNoWrap: PropTypes.bool, // 👈 NOWE
  }).isRequired,
  value: PropTypes.any,
}

export default memo(DataCell)
