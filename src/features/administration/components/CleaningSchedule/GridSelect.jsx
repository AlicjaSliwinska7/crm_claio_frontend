// src/features/administration/components/CleaningSchedule/CleaningGridSelect.jsx
import React from 'react'
import ScheduleGridSelectShared from '../../../../shared/schedules/components/ScheduleGridSelect'

const allowedValues = ['a', 'b', 'c', 'd']

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

// "ą" -> "a" (i ogólnie usuwanie diakrytyków)
const stripDiacritics = (s) => (s ?? '').toString().normalize('NFD').replace(/[\u0300-\u036f]/g, '')

export default function CleaningGridSelect(props) {
  return (
    <ScheduleGridSelectShared
      {...props}
      allowedValues={allowedValues}
      valueToClass={valueToClass}
      displayValue={displayValue}
      normalizeKey={stripDiacritics}
    />
  )
}