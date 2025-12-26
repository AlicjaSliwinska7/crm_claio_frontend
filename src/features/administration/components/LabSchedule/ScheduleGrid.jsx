// src/features/administration/components/LabSchedule/ScheduleGrid.jsx
import React, { useMemo, useCallback } from 'react'
import { format } from 'date-fns'
import { pl } from 'date-fns/locale'
import GridCell from './GridCell'

// wspólna nawigacja klawiaturą
import { makeGridKeyHandler } from '../../../../shared/schedules/grid/keyboardNav'

export default function ScheduleGrid({
  readOnly = false,
  employees,
  daysInMonth,
  schedule,
  isHoliday,
  activeCell,
  onToggleHoliday,
  onCellClick,
  onChange,
  onKeyDown, // opcjonalny – twój własny
  onPaste,
  isInSelectionRange,
}) {
  // klucze dni w miesiącu
  const dateKeys = useMemo(
    () => daysInMonth.map(d => format(d, 'yyyy-MM-dd')),
    [daysInMonth],
  )

  // czy kolumna ma być pomijana w nawigacji (np. święta)
  const isColDisabled = useCallback(
    colIdx => {
      const day = daysInMonth[colIdx]
      return isHoliday(day)
    },
    [daysInMonth, isHoliday],
  )

  // domyślna obsługa strzałek
  const defaultKeyHandler = useMemo(() => {
    return makeGridKeyHandler({
      employees,
      dateKeys,
      readOnly,
      wrap: false,
      isColDisabled,
      onMove: () => {},
      inputSelector: '.cell-input',
      cellSelector: 'td',
    })
  }, [employees, dateKeys, readOnly, isColDisabled])

  // proxy: najpierw twój handler, potem domyślny (jeśli event nie został zatrzymany)
  const keyDownProxy = useCallback(
    (e, name, dateKey) => {
      if (onKeyDown) {
        onKeyDown(e, name, dateKey)
        if (e.defaultPrevented) return
      }
      defaultKeyHandler(e, name, dateKey)
    },
    [onKeyDown, defaultKeyHandler],
  )

  // prosta „sr-only” do caption – tu inline, żeby nie ruszać CSS
  const srOnly = {
    position: 'absolute',
    width: '1px',
    height: '1px',
    padding: 0,
    margin: '-1px',
    overflow: 'hidden',
    clip: 'rect(0, 0, 0, 0)',
    whiteSpace: 'nowrap',
    border: 0,
  }

  return (
    <table className='schedule-table' role='grid' aria-readonly={readOnly}>
      <caption style={srOnly}>Harmonogram pracy laboratorium</caption>
      <thead>
        <tr>
          <th scope='col'>Pracownik</th>
          {daysInMonth.map(day => {
            const dateStr = format(day, 'yyyy-MM-dd')
            const dayName = format(day, 'EEEE', { locale: pl })
            return (
              <th
                key={dateStr}
                scope='col'
                className={isHoliday(day) ? 'holiday-column' : ''}
                title={dayName}
                aria-label={`${format(day, 'dd.MM.yyyy')} – ${dayName}`}
                onClick={() => onToggleHoliday(dateStr)}
              >
                {format(day, 'dd')}
              </th>
            )
          })}
        </tr>
      </thead>

      <tbody>
        {employees.map(name => (
          <tr key={name}>
            <td
              className='employee-name'
              onClick={() =>
                onCellClick(name, format(daysInMonth[0], 'yyyy-MM-dd'), { shiftKey: false })
              }
              title='Kliknij, aby zobaczyć/ukryć podsumowanie'
              tabIndex={readOnly ? 0 : -1}
              scope='row'
            >
              {name}
            </td>

            {daysInMonth.map(day => {
              const dateKey = format(day, 'yyyy-MM-dd')
              const value = schedule[name]?.[dateKey] ?? ''
              const holiday = isHoliday(day)
              const isSelected = isInSelectionRange(name, dateKey)
              const isActive =
                activeCell?.name === name && activeCell?.dateKey === dateKey

              return (
                <GridCell
                  key={`${name}__${dateKey}`}
                  readOnly={readOnly}
                  name={name}
                  dateKey={dateKey}
                  value={value}
                  holiday={holiday}
                  isSelected={isSelected}
                  isActive={isActive}
                  onClick={onCellClick}
                  onChange={onChange}
                  onKeyDown={keyDownProxy}
                  onPaste={onPaste}
                />
              )
            })}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
