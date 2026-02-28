import React from 'react'

/**
 * W pełni defensywny komponent filtrów.
 * - każdy props ma wartość domyślną,
 * - wszystkie listy są rzutowane na puste tablice,
 * - settery są opcjonalne (no-op, jeśli nie podasz).
 */
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

  return (
    <div className="preview-filters">
      <select className="pf-select" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
        <option value="all">Wszystko</option>
        <option value="post">Posty</option>
        <option value="task">Zadania</option>
      </select>

      <select className="pf-select" value={filterAuthor} onChange={(e) => setFilterAuthor(e.target.value)}>
        <option value="">Autor</option>
        {safeAuthors.map((a) => (
          <option key={a} value={a}>{a}</option>
        ))}
      </select>

      <select className="pf-select" value={filterMentioned} onChange={(e) => setFilterMentioned(e.target.value)}>
        <option value="">Oznaczony</option>
        <option value="wszyscy">wszyscy</option>
        {safeUsers.map((u) => (
          <option key={u} value={u}>{u}</option>
        ))}
      </select>

      <select className="pf-select" value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)}>
        <option value="">Priorytet</option>
        <option value="wysoki">Wysoki</option>
        <option value="normalny">Normalny</option>
        <option value="niski">Niski</option>
      </select>

      <select className="pf-select" value={filterTag} onChange={(e) => setFilterTag(e.target.value)}>
        <option value="">Tag</option>
        {safeTags.map((t) => (
          <option key={t} value={t}>{t}</option>
        ))}
      </select>
    </div>
  )
}