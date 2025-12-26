import { useCallback, useMemo, useState } from 'react'

export function useSorting(defaultField = 'group', defaultAsc = true) {
  const [sortField, setSortField] = useState(defaultField)
  const [sortAsc, setSortAsc] = useState(defaultAsc)

  const onSort = useCallback((key) => {
    setSortField(prev => (prev === key ? prev : key))
    setSortAsc(prev => (sortField === key ? !prev : true))
  }, [sortField])

  const sortArrow = useCallback((key) => (sortField === key ? (sortAsc ? ' ▲' : ' ▼') : ''), [sortField, sortAsc])

  const makeSorted = useCallback((rows) => {
    const arr = [...rows]
    const dir = sortAsc ? 1 : -1
    arr.sort((a, b) => {
      const av = a[sortField], bv = b[sortField]
      if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * dir
      return String(av ?? '').localeCompare(String(bv ?? ''), 'pl') * dir
    })
    return arr
  }, [sortField, sortAsc])

  return { sortField, sortAsc, onSort, sortArrow, makeSorted, setSortField, setSortAsc }
}
