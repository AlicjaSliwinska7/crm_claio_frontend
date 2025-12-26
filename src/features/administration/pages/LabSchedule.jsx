// src/features/administration/pages/LabSchedule.jsx
import React, { useMemo } from 'react'
import { format } from 'date-fns'
import { pl } from 'date-fns/locale'
import { ExternalLink } from 'lucide-react'

import FullScreenModal from '../../../shared/modals/modals/FullScreenModal'
import ScheduleHeader from '../components/LabSchedule/ScheduleHeader'
import ScheduleGridSelect from '../components/LabSchedule/ScheduleGridSelect'
import Legend from '../components/LabSchedule/Legend'
import Overtime from '../components/Overtime'

import useLabScheduleLogic from '../hooks/useLabScheduleLogic'
import '../styles/lab-schedule.css'

export default function LabSchedule() {
  const {
    state,
    daysInMonth,
    employees,
    isHoliday,
    setShowFullScreen,
    goPrevMonth,
    goNextMonth,
    toggleCustomHoliday,
    handleChange,
    handleCellClick,
    getSummaryForEmployee,
    isInSelectionRange,
  } = useLabScheduleLogic()

  const formattedMonth = useMemo(
    () => format(state.currentDate, 'LLLL yyyy', { locale: pl }),
    [state.currentDate],
  )

  return (
    <div className='lab-schedule'>
      <ScheduleHeader monthLabel={formattedMonth} onPrev={goPrevMonth} onNext={goNextMonth} />

      <div className='schedule-scroll'>
        <ScheduleGridSelect
          employees={employees}
          daysInMonth={daysInMonth}
          schedule={state.schedule}
          isHoliday={isHoliday}
          isInSelectionRange={isInSelectionRange}
          onToggleHoliday={toggleCustomHoliday}
          onCellClick={handleCellClick}
          onChange={handleChange}
          initialActive={state.activeCell}
          skipHolidaysInNav={false}
        />
      </div>

      <div className='schedule-footer-row'>
        <Overtime schedule={state.schedule} />

        <div className='schedule-overtime-with-menu'>
          <Legend
            selectedEmployee={state.selectedSummaryEmployee}
            getSummaryForEmployee={getSummaryForEmployee}
          />

          <button
            type='button'
            className='options-button'
            aria-haspopup='dialog'
            aria-label='Pokaż harmonogram w trybie pełnoekranowym'
            title='Podgląd harmonogramu'
            onClick={() => setShowFullScreen(true)}
          >
            <ExternalLink size={18} aria-hidden='true' />
          </button>
        </div>
      </div>

      {state.showFullScreen && (
        <FullScreenModal
          onClose={() => setShowFullScreen(false)}
          aria-labelledby='lab-schedule-fullscreen-title'
        >
          <div style={{ padding: 12 }}>
            <h3 id='lab-schedule-fullscreen-title' style={{ textAlign: 'center', marginTop: 0 }}>
              {formattedMonth}
            </h3>
            <ScheduleGridSelect
              employees={employees}
              daysInMonth={daysInMonth}
              schedule={state.schedule}
              isHoliday={isHoliday}
              // w fullscreen nie chcemy „zielonych” zakresów
              isInSelectionRange={() => false}
              onToggleHoliday={() => {}}
              onCellClick={() => {}}
              onChange={() => {}}
              initialActive={
                employees.length && daysInMonth.length
                  ? { name: employees[0], dateKey: format(daysInMonth[0], 'yyyy-MM-dd') }
                  : null
              }
              skipHolidaysInNav={false}
            />
          </div>
        </FullScreenModal>
      )}
    </div>
  )
}
