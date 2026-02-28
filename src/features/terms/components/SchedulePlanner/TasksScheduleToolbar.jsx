import React from 'react'

export default function TasksScheduleToolbar({
  q,
  setQ,

  rangeMode,
  setRangeMode,
  gotoDate,
  setGotoDate,

  empF,
  setEmpF,
  employeesList = [],

  visibleDays,
  zoomBy,

  clearAllFilters,
}) {
  return (
    <div className="ts-toolbar ts-toolbar-grid">
      <div className="group search-group">
        <label className="lbl">Szukaj</label>
        <input
          className="form-control ts-search"
          placeholder="Szukaj tytułu, badania, osoby…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      <div className="group term-group">
        <label className="lbl">Termin</label>
        <div className="inline">
          <select className="form-control" value={rangeMode} onChange={(e) => setRangeMode(e.target.value)}>
            <option value="ten_tydzien">Ten tydzień</option>
            <option value="nastepny_tydzien">Następny tydzień</option>
            <option value="goto">Idź do daty…</option>
          </select>

          {rangeMode === 'goto' && (
            <input
              className="form-control ts-date"
              type="date"
              value={gotoDate}
              onChange={(e) => setGotoDate(e.target.value)}
            />
          )}
        </div>
      </div>

      <div className="group emp-group">
        <label className="lbl">Pracownik</label>
        <select className="form-control" value={empF} onChange={(e) => setEmpF(e.target.value)}>
          <option value="wszyscy">Wszyscy</option>
          {employeesList.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>

      <div className="group range-group">
        <label className="lbl">Zakres</label>
        <div className="range-ctrl">
          <button type="button" className="rc-btn" onClick={() => zoomBy(-1)} aria-label="Mniej dni">
            −
          </button>
          <span className="rc-value">{visibleDays} dni</span>
          <button type="button" className="rc-btn" onClick={() => zoomBy(1)} aria-label="Więcej dni">
            +
          </button>
        </div>
      </div>

      <div className="group clear-group">
        <button
          type="button"
          className="btn-icon"
          onClick={clearAllFilters}
          aria-label="Wyczyść filtry"
          title="Wyczyść filtry"
        >
          ×
        </button>
      </div>
    </div>
  )
}