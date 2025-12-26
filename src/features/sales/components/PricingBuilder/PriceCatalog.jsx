import React, { useMemo, useState } from 'react'
import PriceFilters from './PriceFilters'
import PriceLegend from './PriceLegend'
import PriceMethodCard from './PriceMethodCard'

export default function PriceCatalog({ methods, onPickMethod }) {
  const [query, setQuery] = useState('')
  const [subject, setSubject] = useState('all')
  const [onlyAccredited, setOnlyAccredited] = useState(false)
  const [sort, setSort] = useState('name') // name | baseFirst | baseNext

  const subjects = useMemo(() => {
    const s = new Set()
    methods.forEach(m => m.subject && s.add(m.subject))
    return ['all', ...Array.from(s)]
  }, [methods])

  const filtered = useMemo(() => {
    let rows = methods.slice()
    if (query.trim()) {
      const q = query.trim().toLowerCase()
      rows = rows.filter(m =>
        (m.methodNo || '').toLowerCase().includes(q) ||
        (m.name || '').toLowerCase().includes(q)
      )
    }
    if (subject !== 'all') {
      rows = rows.filter(m => m.subject === subject)
    }
    if (onlyAccredited) {
      rows = rows.filter(m => !!m.accredited)
    }
    switch (sort) {
      case 'baseFirst':
        rows.sort((a, b) => (a.pricing?.baseFirst || 0) - (b.pricing?.baseFirst || 0)); break
      case 'baseNext':
        rows.sort((a, b) => (a.pricing?.baseNext || 0) - (b.pricing?.baseNext || 0)); break
      default:
        rows.sort((a, b) => String(a.name || a.methodNo).localeCompare(String(b.name || b.methodNo)))
    }
    return rows
  }, [methods, query, subject, onlyAccredited, sort])

  return (
    <section className="card">
      <div className="card-head">
        <h3 className="card__h3">Cennik jawny</h3>
        <div className="small muted">przeglądaj metody i dodawaj do wyceny</div>
      </div>

      <div className="catalog">
        {/* LEFT: filters */}
        <aside className="catalog__left">
          <PriceFilters
            query={query}
            setQuery={setQuery}
            subject={subject}
            setSubject={setSubject}
            subjects={subjects}
            onlyAccredited={onlyAccredited}
            setOnlyAccredited={setOnlyAccredited}
            sort={sort}
            setSort={setSort}
          />
        </aside>

        {/* BODY: grid of cards */}
        <div className="catalog__body">
          {filtered.length === 0 ? (
            <div className="catalog__empty muted">Brak metod dla wybranych filtrów.</div>
          ) : (
            <div className="method-grid">
              {filtered.map(m => (
                <PriceMethodCard
                  key={m.id}
                  method={m}
                  onAdd={() => onPickMethod?.(m.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* RIGHT: legend / tips */}
        <aside className="catalog__right">
          <PriceLegend />
        </aside>
      </div>
    </section>
  )
}
