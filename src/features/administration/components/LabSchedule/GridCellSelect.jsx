// src/features/administration/components/LabSchedule/GridCellSelect.jsx
import React, { memo } from 'react'
import ScheduleGridCell from '../../../../shared/schedules/components/ScheduleGridCell'

const valueToClass = (raw) => {
  const v = (raw ?? '').toString()
  if (v === '1') return 'shift-1'
  if (v === '2') return 'shift-2'
  if (v === '3') return 'shift-3'
  if (v === 'u') return 'shift-u'
  if (v === 'l') return 'shift-l'
  return ''
}

function GridCellSelect(props) {
  return (
    <ScheduleGridCell
      {...props}
      valueToClass={valueToClass}
      displayValue={(v) => (v ?? '')}
    />
  )
}

export default memo(GridCellSelect)