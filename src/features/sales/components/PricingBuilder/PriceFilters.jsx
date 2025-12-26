import React from 'react'

export default function PriceFilters({
  query, setQuery,
  subject, setSubject, subjects,
  onlyAccredited, setOnlyAccredited,
  sort, setSort
}) {
  return (
    <div className="filters">
      <div className="ctrl">
        <label>Szukaj</label>
        <input
          type="search"
          placeholder="np. PB-101, zginanie..."
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
      </div>

      <div className="ctrl">
        <label>Tematyka</label>
        <select value={subject} onChange={e => setSubject(e.target.value)}>
          {subjects.map(s => <option key={s} value={s}>{s === 'all' ? 'Wszystkie' : s}</option>)}
        </select>
      </div>

      <label className="checkbox">
        <input
          type="checkbox"
          checked={onlyAccredited}
          onChange={e => setOnlyAccredited(e.target.checked)}
        />
        Tylko akredytowane
      </label>

      <div className="ctrl">
        <label>Sortuj</label>
        <select value={sort} onChange={e => setSort(e.target.value)}>
          <option value="name">Nazwa/Metoda (A→Z)</option>
          <option value="baseFirst">Cena 1. próbki (rosnąco)</option>
          <option value="baseNext">Cena kolejnych (rosnąco)</option>
        </select>
      </div>
    </div>
  )
}
