import { addDays, clamp, dFromStr, diffDays, toMid } from './dates'
import { inferKind, inferPriority, inferTests, inferType } from './infer'

function toTriDiff(v) {
  const n = Number(v) || 0
  if (n <= 1) return 1
  if (n <= 3) return 2
  return 3
}

export function normalizeTasks(original = []) {
  return original.map((t, i) => {
    const endRaw = t.endDate || t.dueDate || t.date || t.targetDate
    const end = endRaw ? dFromStr(endRaw) : null

    let start = t.startDate ? dFromStr(t.startDate) : null
    if (!start) {
      if (end) start = addDays(end, -clamp(Number(t.difficulty || 3), 1, 5))
    }
    if (!start) start = toMid(new Date())

    const E = end || start
    const length = diffDays(start, E) + 1
    const autoDiff = Math.max(1, Math.min(3, Math.round(length / 4) + 1))

    return {
      id: t.id || `t-${i}`,
      title: t.title || '(bez tytułu)',
      assignees: Array.isArray(t.assignees) ? t.assignees : [],
      status: t.status || 'przydzielone',
      type: t.type || inferType(t.title || ''),
      kind: inferKind(t),
      priority: inferPriority(t),
      start,
      end: E,
      difficulty: toTriDiff(t.difficulty ?? autoDiff),
      tests: Array.isArray(t.tests) ? t.tests : inferTests(t.title),
      link: `/zadania/moje/${t.id || `t-${i}`}`,
    }
  })
}