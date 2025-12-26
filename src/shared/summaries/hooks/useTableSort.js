import { useCallback } from 'react'

export default function useTableSort(sortField, setSortField, sortAsc, setSortAsc) {
  const handleSort = useCallback((field) => {
    if (sortField === field) setSortAsc(prev => !prev)
    else { setSortField(field); setSortAsc(true) }
  }, [sortField, setSortField, setSortAsc])

  const sortArrow = useCallback((field) => (
    sortField === field ? (sortAsc ? ' ▲' : ' ▼') : ''
  ), [sortField, sortAsc])

  const ariaSort = useCallback((field) => (
    sortField !== field ? 'none' : (sortAsc ? 'ascending' : 'descending')
  ), [sortField, sortAsc])

  return { handleSort, sortArrow, ariaSort }
}
