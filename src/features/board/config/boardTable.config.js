// src/features/board/config/Table.config.js
import { format } from 'date-fns'
import { col } from '../../../shared/tables'
import { parseDayLocal, safeFormatDateTime } from '../utils/boardLayout'

/**
 * Uwaga:
 * - BoardTable teraz dostaje znormalizowane wiersze z boardTableAdapter (tags/mentions/createdAt/targetDay…)
 * - Ten config nadal działa dla UI DataTableWithActions, ale sortowanie bazuje na polach z adaptera.
 */

const safeArr = (v) => (Array.isArray(v) ? v : [])

const fmtTargetDay = (targetDate) => {
  const d = targetDate ? parseDayLocal(targetDate) : null
  return d ? format(d, 'dd.MM.yyyy') : '—'
}

const fmtType = (t) => (t === 'task' ? 'Zadanie' : 'Post')

const fmtMentions = (m) => {
  const arr = safeArr(m).filter(Boolean)
  return arr.length ? arr.join(', ') : '—'
}

const fmtTags = (tags) => {
  const arr = safeArr(tags).filter(Boolean)
  return arr.length ? arr.map((t) => `#${t}`).join(' ') : '—'
}

/* =========================================================
   Kolumny tabeli (shared/tables DataTableWithActions)
   ========================================================= */

export const BOARD_TABLE_COLUMNS = [
  col('date', 'Data dodania', {
    type: 'datetime',
    width: 160,
    render: (val, row) => safeFormatDateTime(val ?? row?.date),
    titleAccessor: (row) => safeFormatDateTime(row?.date),
  }),

  col('targetDate', 'Dzień', {
    type: 'date',
    width: 130,
    render: (val, row) => fmtTargetDay(val ?? row?.targetDate),
    titleAccessor: (row) => fmtTargetDay(row?.targetDate),
  }),

  col('type', 'Typ', {
    width: 110,
    render: (val, row) => fmtType(val ?? row?.type),
    titleAccessor: (row) => fmtType(row?.type),
  }),

  col('title', 'Tytuł', {
    minWidth: 260,
    className: 'bl-td--bold',
    render: (val, row) => (val ?? row?.title) || '—',
    titleAccessor: (row) => row?.title || '',
  }),

  col('author', 'Autor', {
    minWidth: 180,
    render: (val, row) => (val ?? row?.author) || '—',
    titleAccessor: (row) => row?.author || '',
  }),

  col('mentions', 'Wzmianki', {
    minWidth: 220,
    render: (val, row) => fmtMentions(val ?? row?.mentions),
    titleAccessor: (row) => safeArr(row?.mentions).join(', '),
  }),

  col('tags', 'Tagi', {
    minWidth: 220,
    render: (val, row) => fmtTags(val ?? row?.tags),
    titleAccessor: (row) => fmtTags(row?.tags).replace(/—/g, ''),
  }),
]

/* =========================================================
   Sortowanie (shared/tables sortRows optionsPerKey)
   ========================================================= */

export const BOARD_TABLE_SORT_OPTIONS = {
  // ✅ SSOT: bazujemy na polach z adaptera (createdAt/targetDay),
  // fallback na stringi, jeśli ktoś poda surowe rows bez adaptera.
  date: {
    type: 'date',
    accessor: (row) => row?.createdAt ?? row?.date ?? '',
  },
  targetDate: {
    type: 'date',
    accessor: (row) => row?.targetDay ?? row?.targetDate ?? '',
  },
  type: {
    type: 'number',
    accessor: (row) => (row?.type === 'task' ? 1 : 0),
  },
  title: {
    type: 'string',
    accessor: (row) => row?.title || '',
  },
  author: {
    type: 'string',
    accessor: (row) => row?.author || '',
  },
  mentions: {
    type: 'string',
    accessor: (row) => safeArr(row?.mentions).join(', '),
  },
  tags: {
    type: 'string',
    accessor: (row) => safeArr(row?.tags).map((t) => `#${t}`).join(' '),
  },
}

export const BOARD_TABLE_DEFAULT_SORT = { key: 'date', direction: 'desc' }