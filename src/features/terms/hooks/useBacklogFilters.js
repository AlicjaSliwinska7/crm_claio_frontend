import { useMemo, useState } from 'react'

export function useBacklogFilters(listTasks) {
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState({
    type: { admin: true, client: true, tech: true, other: true },
    status: { assigned: true, progress: true, blocked: true, done: true },
    difficulty: { easy: true, medium: true, hard: true },
    priority: { high: true, normal: true, low: true },
  })

  const prioOrder = { high: 0, normal: 1, low: 2 }

  const filteredBacklog = useMemo(() => {
    const q = query.trim().toLowerCase()
    return listTasks
      .filter((t) => !t.dateISO && !t.slot)
      .filter((t) => filters.type[t.type ?? 'other'])
      .filter((t) => filters.status[t.status ?? 'assigned'])
      .filter((t) => filters.difficulty[t.difficulty ?? 'medium'])
      .filter((t) => filters.priority[t.priority ?? 'normal'])
      .filter((t) => !q || t.title?.toLowerCase().includes(q) || String(t.id).toLowerCase().includes(q))
      .sort((a, b) => {
        const da = +new Date(a.deadline || 0)
        const db = +new Date(b.deadline || 0)
        if (da !== db) return da - db
        return (prioOrder[a.priority || 'normal'] ?? 9) - (prioOrder[b.priority || 'normal'] ?? 9)
      })
  }, [listTasks, query, filters])

  return { query, setQuery, filters, setFilters, filteredBacklog }
}