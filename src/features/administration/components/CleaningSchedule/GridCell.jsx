// src/features/administration/components/CleaningSchedule/CleaningGridCell.jsx
import React, { memo } from 'react'
import ScheduleGridCell from '../../../../shared/schedules/components/ScheduleGridCell'

const valueToClass = (raw) => {
  const v = (raw ?? '').toString().trim().toLowerCase()
  if (v === 'a') return 'shift-a'
  if (v === 'b') return 'shift-b'
  if (v === 'c') return 'shift-c'
  if (v === 'd') return 'shift-d'
  return ''
}

const displayValue = (raw) => {
  const v = (raw ?? '').toString().trim()
  return v ? v.toUpperCase() : ''
}

function CleaningGridCell(props) {
  return (
    <ScheduleGridCell
      {...props}
      valueToClass={valueToClass}
      displayValue={displayValue}
    />
  )
}

export default memo(CleaningGridCell)