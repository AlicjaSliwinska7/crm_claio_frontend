import { useState } from 'react'
import { addDays, startOfWeek } from 'date-fns'

import {
  SLOT_META,
  MAX_BADGES_PER_SLOT,
  BADGE_COLOR_MODE,
  TYPE_LABELS,
  STATUS_LABELS,
  DIFF_LABELS,
  PRIO_LABELS,
  SHIFT_META,
} from './constants'

import { today, iso, fmt } from './dateUtils'
import { setDataId, getDataId, setGroupDrag, getGroupDrag } from './dndEncoding'

import { usePlannerRange } from './usePlannerRange'
import { useTasksState } from './useTasksState'
import { useBacklogFilters } from './useBacklogFilters'
import { usePagination } from './usePagination'
import { useTasksByDaySlot, useDayDeadlineFlags } from './selectors'
import { useDaySideData } from './useDaySideData'
import { useMajorityOf } from './useMajorityOf'
import { useTaskActions } from './useTaskActions'
import { useDnDHandlers } from './useDnDHandlers'
import { useBadges } from './useBadges'

/**
 * IMPORTANT:
 * Komponenty importują stałe/utility z '../../hooks/useSchedulePlanner'.
 * Dlatego tu robimy “named exports” wprost (najbardziej kompatybilne w CRA).
 */
export {
  // constants
  SLOT_META,
  MAX_BADGES_PER_SLOT,
  BADGE_COLOR_MODE,
  TYPE_LABELS,
  STATUS_LABELS,
  DIFF_LABELS,
  PRIO_LABELS,
  SHIFT_META,
  // date utils
  today,
  iso,
  fmt,
  // dnd
  setDataId,
  getDataId,
  setGroupDrag,
  getGroupDrag,
}

/* =================== MOCKI (jak wcześniej) =================== */

export const MOCK_TASKS = [
  {
    id: 'T-001',
    title: 'Raport – wrzesień',
    assignees: ['Alicja'],
    priority: 'normal',
    deadline: iso(addDays(today(), 10)),
    type: 'admin',
    status: 'assigned',
    difficulty: 'medium',
  },
  {
    id: 'T-002',
    title: 'Audyt wewnętrzny – checklisty',
    assignees: ['Alicja'],
    priority: 'high',
    deadline: iso(addDays(today(), 2)),
    type: 'client',
    status: 'progress',
    difficulty: 'hard',
  },
  {
    id: 'T-003',
    title: 'Wysyłka sprawozdania',
    assignees: ['Jan'],
    priority: 'low',
    deadline: iso(addDays(today(), 14)),
    type: 'tech',
    status: 'assigned',
    difficulty: 'easy',
  },
  {
    id: 'T-004',
    title: 'Spotkanie z klientem X (zadanie)',
    assignees: ['Alicja', 'Jan'],
    priority: 'normal',
    deadline: iso(addDays(today(), 6)),
    type: 'other',
    status: 'blocked',
    difficulty: 'medium',
  },
]

export const MOCK_MEETINGS = [{ id: 'M-01', dateISO: iso(today()), title: 'Daily z zespołem', time: '09:00' }]
export const MOCK_ALERTS = [{ id: 'N-01', dateISO: iso(today()), title: 'Przypomnienie: RODO szkolenie', time: '12:00' }]
export const MOCK_OTHER = [{ id: 'O-01', dateISO: iso(today()), title: 'Delegacja – podpisy', time: '15:30' }]

const _WEEK0 = startOfWeek(today(), { weekStartsOn: 1 })
export const MOCK_SHIFTS = {
  [iso(_WEEK0)]: 'morning',
  [iso(addDays(_WEEK0, 1))]: 'afternoon',
  [iso(addDays(_WEEK0, 2))]: 'evening',
  [iso(addDays(_WEEK0, 3))]: 'morning',
  [iso(addDays(_WEEK0, 4))]: 'afternoon',
  [iso(addDays(_WEEK0, 5))]: 'evening',
  [iso(addDays(_WEEK0, 6))]: 'morning',
}

/* =================== HOOK (API bez zmian) =================== */

export function useSchedulePlanner({
  initialDate = new Date(),
  initialTasks = MOCK_TASKS,
  initialMeetings = MOCK_MEETINGS,
  initialAlerts = MOCK_ALERTS,
  initialOther = MOCK_OTHER,
  userShifts = MOCK_SHIFTS,
  onTaskOpenRoute = (task) => {
    window.location.href = `/zadania/${encodeURIComponent(task.id)}`
  },
  modalApi,
} = {}) {
  const range = usePlannerRange(initialDate)
  const tasks = useTasksState(initialTasks)

  const backlog = useBacklogFilters(tasks.listTasks)

  const pager = usePagination(backlog.filteredBacklog, {
    initialPerPage: 10,
    resetDeps: [backlog.query, backlog.filters],
  })

  const tasksByDaySlot = useTasksByDaySlot(range.days, tasks.listTasks)
  const dayDeadlineFlags = useDayDeadlineFlags(range.days, tasksByDaySlot)

  const daySide = useDaySideData(initialMeetings, initialAlerts, initialOther)
  const majorityOf = useMajorityOf()

  const actions = useTaskActions({
    listTasks: tasks.listTasks,
    setTaskDateAndSlot: tasks.setTaskDateAndSlot,
    setListTasks: tasks.setListTasks,
    modalApi,
  })

  const dnd = useDnDHandlers({
    setTaskDateAndSlot: tasks.setTaskDateAndSlot,
    assignWithDeadlineCheck: actions.assignWithDeadlineCheck,
    moveGroupTo: actions.moveGroupTo,
  })

  const badges = useBadges({ majorityOf })

  const [editor, setEditor] = useState(null)

  return {
    userShifts,
    onTaskOpenRoute,

    start: range.start,
    setStart: range.setStart,
    days: range.days,
    selectedDay: range.selectedDay,
    setSelectedDay: range.setSelectedDay,
    selectDay: range.selectDay,

    listTasks: tasks.listTasks,
    setListTasks: tasks.setListTasks,

    query: backlog.query,
    setQuery: backlog.setQuery,
    filters: backlog.filters,
    setFilters: backlog.setFilters,

    page: pager.page,
    setPage: pager.setPage,
    perPage: pager.perPage,
    setPerPage: pager.setPerPage,
    filteredBacklog: backlog.filteredBacklog,
    pagedBacklog: pager.pagedItems,
    pageSafe: pager.pageSafe,
    totalPages: pager.totalPages,

    dragKey: dnd.dragKey,
    setDragKey: dnd.setDragKey,
    tasksByDaySlot,
    badgesForSlot: badges.badgesForSlot,
    badgeFillClassForGroup: badges.badgeFillClassForGroup,
    typeToBadgeClass: badges.typeToBadgeClass,
    isPastDay: dnd.isPastDay,
    allow: dnd.allow,
    dropTo: dnd.dropTo,
    onDropBacklog: dnd.onDropBacklog,
    onDropSlot: dnd.onDropSlot,

    moveGroupTo: actions.moveGroupTo,
    setTaskDateAndSlot: tasks.setTaskDateAndSlot,
    assignWithDeadlineCheck: actions.assignWithDeadlineCheck,
    removeTaskPlacement: tasks.removeTaskPlacement,

    dayMeetings: daySide.dayMeetings,
    dayAlerts: daySide.dayAlerts,
    dayOther: daySide.dayOther,
    dayDeadlineFlags,

    hiddenDateInput: range.hiddenDateInput,
    jumpToDate: range.jumpToDate,
    onPickDate: range.onPickDate,
    goPrevDay: range.goPrevDay,
    goNextDay: range.goNextDay,
    goPrevWeek: range.goPrevWeek,
    goNextWeek: range.goNextWeek,
    goToday: range.goToday,

    editor,
    setEditor,

    majorityOf,
  }
}