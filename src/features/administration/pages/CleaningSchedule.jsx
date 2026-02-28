// src/features/administration/pages/CleaningSchedule.jsx
import React, { useMemo } from 'react'
import { format } from 'date-fns'
import { pl } from 'date-fns/locale'
import { ExternalLink } from 'lucide-react'

import FullScreenModal from '../../../shared/modals/modals/FullScreenModal'
import ScheduleHeader from '../components/LabSchedule/ScheduleHeader'

import CleaningGridSelect from '../components/CleaningSchedule/GridSelect'
import CleaningLegend from '../components/CleaningSchedule/Legend'

import useCleaningScheduleLogic from '../hooks/useCleaningScheduleLogic'
import '../styles/schedule.css'

export default function CleaningSchedule() {
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
  } = useCleaningScheduleLogic()

  const formattedMonth = useMemo(
    () => format(state.currentDate, 'LLLL yyyy', { locale: pl }),
    [state.currentDate]
  )

  return (
    <div className="lab-schedule cleaning-schedule">
      <ScheduleHeader monthLabel={formattedMonth} onPrev={goPrevMonth} onNext={goNextMonth} />

      <div className="schedule-scroll">
        <CleaningGridSelect
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

      <div className="schedule-footer-row">
        {/* zostawiamy układ jak w LabSchedule; po lewej może być kiedyś “podsumowanie / eksport” */}
        <div />

        <div className="schedule-overtime-with-menu">
          <CleaningLegend
            selectedEmployee={state.selectedSummaryEmployee}
            getSummaryForEmployee={getSummaryForEmployee}
          />

          <button
            type="button"
            className="options-button"
            aria-haspopup="dialog"
            aria-label="Pokaż grafik sprzątania w trybie pełnoekranowym"
            title="Podgląd grafiku sprzątania"
            onClick={() => setShowFullScreen(true)}
          >
            <ExternalLink size={18} aria-hidden="true" />
          </button>
        </div>
      </div>

      {state.showFullScreen && (
        <FullScreenModal
          onClose={() => setShowFullScreen(false)}
          aria-labelledby="cleaning-schedule-fullscreen-title"
        >
          <div style={{ padding: 12 }}>
            <h3 id="cleaning-schedule-fullscreen-title" style={{ textAlign: 'center', marginTop: 0 }}>
              {formattedMonth}
            </h3>

            <CleaningGridSelect
              employees={employees}
              daysInMonth={daysInMonth}
              schedule={state.schedule}
              isHoliday={isHoliday}
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