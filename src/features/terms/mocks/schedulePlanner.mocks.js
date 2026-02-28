// src/features/terms/hooks/schedulePlanner/schedulePlanner.mocks.js
import { addDays, startOfWeek } from 'date-fns'

const toMid = (d) => {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

export const today = () => toMid(new Date())

export const iso = (d) => {
  const x = new Date(d)
  const y = x.getFullYear()
  const m = String(x.getMonth() + 1).padStart(2, '0')
  const da = String(x.getDate()).padStart(2, '0')
  return `${y}-${m}-${da}`
}

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

const WEEK0 = startOfWeek(today(), { weekStartsOn: 1 })

export const MOCK_SHIFTS = {
  [iso(WEEK0)]: 'morning',
  [iso(addDays(WEEK0, 1))]: 'afternoon',
  [iso(addDays(WEEK0, 2))]: 'evening',
  [iso(addDays(WEEK0, 3))]: 'morning',
  [iso(addDays(WEEK0, 4))]: 'afternoon',
  [iso(addDays(WEEK0, 5))]: 'evening',
  [iso(addDays(WEEK0, 6))]: 'morning',
}