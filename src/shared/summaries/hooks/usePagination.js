// src/shared/summaries/hooks/usePagination.js
import { useMemo, useState, useEffect } from 'react'

export default function usePagination(totalItems, initialSize = 10) {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(initialSize)
  const totalPages = Math.max(1, Math.ceil((totalItems || 0) / pageSize))

  useEffect(() => {
    if (page > totalPages) setPage(totalPages)
  }, [totalPages, page])

  const rangeLabel = useMemo(() => {
    if (!totalItems) return 'Brak wierszy do wyświetlenia'
    const start = (page - 1) * pageSize + 1
    const end = Math.min(totalItems, page * pageSize)
    return `Wiersze ${start}–${end} z ${totalItems}`
  }, [page, pageSize, totalItems])

  return { page, setPage, pageSize, setPageSize, totalPages, rangeLabel }
}
