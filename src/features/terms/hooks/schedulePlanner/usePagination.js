import { useEffect, useMemo, useState } from 'react'

export function usePagination(items, { initialPerPage = 10, resetDeps = [] } = {}) {
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(initialPerPage)

  const totalPages = Math.max(1, Math.ceil(items.length / perPage))
  const pageSafe = Math.min(page, totalPages)

  const pagedItems = useMemo(() => {
    const startIdx = (pageSafe - 1) * perPage
    return items.slice(startIdx, startIdx + perPage)
  }, [items, pageSafe, perPage])

  // reset do 1 po zmianie query/filters/perPage (tak jak u Ciebie było)
  useEffect(() => setPage(1), [...resetDeps, perPage]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (page > totalPages) setPage(totalPages)
  }, [totalPages]) // eslint-disable-line react-hooks/exhaustive-deps

  return { page, setPage, perPage, setPerPage, totalPages, pageSafe, pagedItems }
}