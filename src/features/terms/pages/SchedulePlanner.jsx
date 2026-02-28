// src/features/terms/pages/SchedulePlanner.jsx
import React from 'react'
import { useModal } from '../../../app/providers/GlobalModalProvider'
import '../styles/schedule-planner.css'

import { useSchedulePlanner, MOCK_TASKS, MOCK_MEETINGS, MOCK_ALERTS, MOCK_OTHER, MOCK_SHIFTS } from '../hooks/useSchedulePlanner'

import DayDetailsBar from '../components/planner/DayDetailsBar'
import BacklogPanel from '../components/planner/BacklogPanel'
import PlannerToolbar from '../components/planner/PlannerToolbar'
import CalendarGrid from '../components/planner/CalendarGrid'
import SlotEditorOverlay from '../components/planner/SlotEditorOverlay'

export default function SchedulePlanner({
  initialDate = new Date(),
  initialTasks = MOCK_TASKS,
  initialMeetings = MOCK_MEETINGS,
  initialAlerts = MOCK_ALERTS,
  initialOther = MOCK_OTHER,
  userShifts = MOCK_SHIFTS,
  onTaskOpenRoute,
}) {
  const modal = useModal()

  const sp = useSchedulePlanner({
    initialDate,
    initialTasks,
    initialMeetings,
    initialAlerts,
    initialOther,
    userShifts,
    onTaskOpenRoute,
    modalApi: modal,
  })

  return (
    <div className="sp-planner">
      {/* ✅ Kafelek / pasek podsumowania dnia (nie gubimy) */}
      <DayDetailsBar
        selectedDay={sp.selectedDay}
        userShifts={sp.userShifts}
        dayMeetings={sp.dayMeetings}
        dayAlerts={sp.dayAlerts}
        dayOther={sp.dayOther}
        tasksByDaySlot={sp.tasksByDaySlot}
        onTaskOpenRoute={sp.onTaskOpenRoute}
      />

      {/* BACKLOG + KALENDARZ */}
      <section className="planner__dock">
        <BacklogPanel
          dragKey={sp.dragKey}
          allow={sp.allow}
          dropTo={sp.dropTo}
          onDropBacklog={sp.onDropBacklog}
          query={sp.query}
          setQuery={sp.setQuery}
          filters={sp.filters}
          setFilters={sp.setFilters}
          filteredBacklog={sp.filteredBacklog}
          pagedBacklog={sp.pagedBacklog}
          perPage={sp.perPage}
          setPerPage={sp.setPerPage}
          pageSafe={sp.pageSafe}
          totalPages={sp.totalPages}
          setPage={sp.setPage}
          onTaskOpenRoute={sp.onTaskOpenRoute}
        />

        {/* KALENDARZ */}
        <div className="planner__calendar-col">
          <PlannerToolbar
            days={sp.days}
            goPrevWeek={sp.goPrevWeek}
            goPrevDay={sp.goPrevDay}
            goToday={sp.goToday}
            goNextDay={sp.goNextDay}
            goNextWeek={sp.goNextWeek}
            jumpToDate={sp.jumpToDate}
            hiddenDateInput={sp.hiddenDateInput}
            onPickDate={sp.onPickDate}
          />

          <CalendarGrid
            days={sp.days}
            dayMeetings={sp.dayMeetings}
            dayAlerts={sp.dayAlerts}
            dayOther={sp.dayOther}
            dayDeadlineFlags={sp.dayDeadlineFlags}
            userShifts={sp.userShifts}
            selectDay={sp.selectDay}
            tasksByDaySlot={sp.tasksByDaySlot}
            badgesForSlot={sp.badgesForSlot}
            badgeFillClassForGroup={sp.badgeFillClassForGroup}
            typeToBadgeClass={sp.typeToBadgeClass}
            dragKey={sp.dragKey}
            isPastDay={sp.isPastDay}
            allow={sp.allow}
            dropTo={sp.dropTo}
            onDropSlot={sp.onDropSlot}
            setEditor={sp.setEditor}
          />
        </div>
      </section>

      {/* MODAL EDYCJI SLOTU */}
      <SlotEditorOverlay
        editor={sp.editor}
        setEditor={sp.setEditor}
        tasksByDaySlot={sp.tasksByDaySlot}
        removeTaskPlacement={sp.removeTaskPlacement}
        assignWithDeadlineCheck={sp.assignWithDeadlineCheck}
        onTaskOpenRoute={sp.onTaskOpenRoute}
        modalApi={modal}
      />
    </div>
  )
}