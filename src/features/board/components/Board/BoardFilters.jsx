// src/features/board/components/Board/BoardFilters.jsx
import React, { useMemo, useCallback } from 'react'
import { FilterSelect } from '../../../../shared/tables'

export default function BoardFilters({
  filterType = 'all',
  setFilterType = () => {},
  filterAuthor = '',
  setFilterAuthor = () => {},
  filterMentioned = '',
  setFilterMentioned = () => {},
  filterPriority = '',
  setFilterPriority = () => {},
  filterTag = '',
  setFilterTag = () => {},
  authors = [],
  users = [],
  tags = [],
}) {
  const safeAuthors = Array.isArray(authors) ? authors : []
  const safeUsers = Array.isArray(users) ? users : []
  const safeTags = Array.isArray(tags) ? tags : []

  // FilterSelect emituje event jak native select => bierzemy e.target.value
  const onType = useCallback((e) => setFilterType(e?.target?.value ?? 'all'), [setFilterType])
  const onAuthor = useCallback((e) => setFilterAuthor(e?.target?.value ?? ''), [setFilterAuthor])
  const onMentioned = useCallback((e) => setFilterMentioned(e?.target?.value ?? ''), [setFilterMentioned])
  const onPriority = useCallback((e) => setFilterPriority(e?.target?.value ?? ''), [setFilterPriority])
  const onTag = useCallback((e) => setFilterTag(e?.target?.value ?? ''), [setFilterTag])

  const typeOptions = useMemo(
    () => [
      { value: 'all', label: 'Wszystko' },
      { value: 'post', label: 'Posty' },
      { value: 'task', label: 'Zadania' },
    ],
    []
  )

  const authorOptions = useMemo(() => safeAuthors.map((a) => ({ value: a, label: a })), [safeAuthors])

  const mentionedOptions = useMemo(
    () => [{ value: 'wszyscy', label: 'wszyscy' }, ...safeUsers.map((u) => ({ value: u, label: u }))],
    [safeUsers]
  )

  const priorityOptions = useMemo(
    () => [
      { value: 'wysoki', label: 'Wysoki' },
      { value: 'normalny', label: 'Normalny' },
      { value: 'niski', label: 'Niski' },
    ],
    []
  )

  const tagOptions = useMemo(() => safeTags.map((t) => ({ value: t, label: t })), [safeTags])

  return (
    <div className="board-filters">
      <FilterSelect
        className="board-filter"
        ariaLabel="Typ"
        value={filterType}
        onChange={onType}
        options={typeOptions}
      />

      <FilterSelect
        className="board-filter"
        ariaLabel="Autor"
        value={filterAuthor}
        onChange={onAuthor}
        options={authorOptions}
        includeAll
        allValue=""
        allLabel="Autor"
      />

      <FilterSelect
        className="board-filter"
        ariaLabel="Oznaczony"
        value={filterMentioned}
        onChange={onMentioned}
        options={mentionedOptions}
        includeAll
        allValue=""
        allLabel="Oznaczony"
      />

      <FilterSelect
        className="board-filter"
        ariaLabel="Priorytet"
        value={filterPriority}
        onChange={onPriority}
        options={priorityOptions}
        includeAll
        allValue=""
        allLabel="Priorytet"
      />

      <FilterSelect
        className="board-filter"
        ariaLabel="Tag"
        value={filterTag}
        onChange={onTag}
        options={tagOptions}
        includeAll
        allValue=""
        allLabel="Tag"
      />
    </div>
  )
}