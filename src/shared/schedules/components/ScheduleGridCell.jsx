// src/shared/schedules/components/ScheduleGridCell.jsx
import React, { memo } from 'react'

/**
 * Wspólna komórka siatki harmonogramów (LabSchedule / CleaningSchedule).
 * Sterowana przez:
 * - valueToClass(value) -> np. 'shift-1' / 'shift-a'
 * - displayValue(value) -> np. identity / upper-case
 */
function ScheduleGridCell({
  id,
  name,
  dateKey,
  value,
  holiday,
  isSelected,
  isActive,
  onClick,

  valueToClass,
  displayValue,
}) {
  const raw = (value ?? '').toString()
  const clsValue = valueToClass ? valueToClass(raw) : ''
  const shown = displayValue ? displayValue(raw) : raw

  const cellClass = `
    ${holiday ? 'holiday-column' : ''}
    ${clsValue || ''}
    ${isSelected ? 'selected-cell' : ''}
    ${isActive ? 'active-cell' : ''}
  `

  return (
    <td
      id={id}
      role="gridcell"
      className={cellClass}
      data-name={name}
      data-date={dateKey}
      onClick={(e) => onClick?.(name, dateKey, e)}
      tabIndex={-1}
      aria-selected={!!isActive}
      title={shown || ''}
    >
      <div className="cell-readonly">{shown ?? ''}</div>
    </td>
  )
}

export default memo(ScheduleGridCell)