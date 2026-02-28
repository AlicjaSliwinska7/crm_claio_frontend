// src/features/terms/hooks/schedulePlanner/useSchedulePlanner.js
import { useState } from 'react'

import {
  SLOT_META,
  MAX_BADGES_PER_SLOT,
  BADGE_COLOR_MODE,
  TYPE_LABELS,
  STATUS_LABELS,
  DIFF_LABELS,
  PRIO_LABELS,
  SHIFT_META,
} from '../../utils/constants'

import { today as _today, iso as _iso, fmt as _fmt } from '../../utils/dates'
import { setDataId, getDataId, setGroupDrag, getGroupDrag } from '../../utils/dndEncoding'

import { usePlannerRange } from './usePlannerRange'
import { useTasksState } from './useTasksState'
import { useBacklogFilters } from './useBacklogFilters'
import { usePagination } from './usePagination'
import { useTasksByDaySlot, useDayDeadlineFlags } from '../../utils/selectors'
import { useDaySideData } from './useDaySideData'
import { useMajorityOf } from './useMajorityOf'
import { useTaskActions } from './useTaskActions'
import { useDnDHandlers } from './useDnDHandlers'
import { useBadges } from './useBadges'

import {
  MOCK_TASKS,
  MOCK_MEETINGS,
  MOCK_ALERTS,
  MOCK_OTHER,
  MOCK_SHIFTS,
} from '../../mocks/schedulePlanner.mocks'

export {
  SLOT_META,
  MAX_BADGES_PER_SLOT,
  BADGE_COLOR_MODE,
  TYPE_LABELS,
  STATUS_LABELS,
  DIFF_LABELS,
  PRIO_LABELS,
  SHIFT_META,
  setDataId,
  getDataId,
  setGroupDrag,
  getGroupDrag,
  _fmt as fmt,
  _iso as iso,
  _today as today,
  MOCK_TASKS,
  MOCK_MEETINGS,
  MOCK_ALERTS,
  MOCK_OTHER,
  MOCK_SHIFTS,
}

export function useSchedulePlanner({
  initialDate = new Date(),
  initialTasks = MOCK_TASKS,
  initialMeetings = MOCK_MEETINGS,
  initialAlerts = MOCK_ALERTS,
  initialOther = MOCK_OTHER,
  userShifts = MOCK_SHIFTS,
  onTaskOpenRoute,
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

    // range
    days: range.days,
    selectedDay: range.selectedDay,
    selectDay: range.selectDay,
    goPrevWeek: range.goPrevWeek,
    goPrevDay: range.goPrevDay,
    goToday: range.goToday,
    goNextDay: range.goNextDay,
    goNextWeek: range.goNextWeek,
    jumpToDate: range.jumpToDate,
    hiddenDateInput: range.hiddenDateInput,
    onPickDate: range.onPickDate,

    // tasks
    listTasks: tasks.listTasks,
    setListTasks: tasks.setListTasks,

    // backlog filters
    query: backlog.query,
    setQuery: backlog.setQuery,
    filters: backlog.filters,
    setFilters: backlog.setFilters,

    // paging
    pagedBacklog: pager.pagedItems,
    filteredBacklog: backlog.filteredBacklog,
    perPage: pager.perPage,
    setPerPage: pager.setPerPage,
    pageSafe: pager.pageSafe,
    totalPages: pager.totalPages,
    setPage: pager.setPage,

    // computed
    tasksByDaySlot,
    dayDeadlineFlags,
    dayMeetings: daySide.dayMeetings,
    dayAlerts: daySide.dayAlerts,
    dayOther: daySide.dayOther,

    // badges
    badgesForSlot: badges.badgesForSlot,
    badgeFillClassForGroup: badges.badgeFillClassForGroup,
    typeToBadgeClass: badges.typeToBadgeClass,

    // dnd
    dragKey: dnd.dragKey,
    allow: dnd.allow,
    dropTo: dnd.dropTo,
    isPastDay: dnd.isPastDay,
    onDropBacklog: dnd.onDropBacklog,
    onDropSlot: dnd.onDropSlot,
    setDragKey: dnd.setDragKey,

    // actions
    assignWithDeadlineCheck: actions.assignWithDeadlineCheck,
    moveGroupTo: actions.moveGroupTo,
    removeTaskPlacement: tasks.removeTaskPlacement,
    setTaskDateAndSlot: tasks.setTaskDateAndSlot,

    // editor
    editor,
    setEditor,

    // utils
    majorityOf,
  }
}