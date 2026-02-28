// src/features/tests/components/TestsSummary/TestsFilters.jsx
import React, { memo } from 'react'
import PropTypes from 'prop-types'
import { Filter, XCircle } from 'lucide-react'

import { SummarySection, SummaryCard, SummaryHeader } from '../../../../shared/summaries'

function TestsFilters({
  // search + accr (dla tabeli)
  filter,
  setFilter,
  accrFilter,
  setAccrFilter,

  // zakres dat (dla executions/wykresów/KPI)
  rangePreset,
  setRangePreset,
  from,
  setFrom,
  to,
  setTo,

  onReset,
}) {
  return (
    <SummarySection className="es-section">
      <SummaryCard className="es-card">
        <SummaryHeader
          title="Filtry główne"
          icon={<Filter className="es-headIcon" aria-hidden="true" />}
          actions={
            <button
              type="button"
              className="tss-icon-btn tss-btn--icon"
              onClick={onReset}
              title="Wyczyść filtry"
              aria-label="Wyczyść filtry"
            >
              <XCircle size={18} />
            </button>
          }
        />

        <div className="es-panel-controls">
          <div className="es-col" style={{ minWidth: 220 }}>
            <label className="es-label">Zakres (preset)</label>
            <select
              className="tss-select"
              value={rangePreset}
              onChange={(e) => setRangePreset(e.target.value)}
              title="Preset zakresu"
            >
              <option value="all">Wszystko</option>
              <option value="year">Ostatni rok</option>
              <option value="quarter">Ostatnie 90 dni</option>
              <option value="month">Ostatnie 30 dni</option>
              <option value="custom">Własny</option>
            </select>
          </div>

          <div className="es-col" style={{ minWidth: 220 }}>
            <label className="es-label">Od</label>
            <input
              className="tss-input tss-input--date"
              type="date"
              value={from}
              onChange={(e) => {
                setRangePreset('custom')
                setFrom(e.target.value)
              }}
            />
          </div>

          <div className="es-col" style={{ minWidth: 220 }}>
            <label className="es-label">Do</label>
            <input
              className="tss-input tss-input--date"
              type="date"
              value={to}
              onChange={(e) => {
                setRangePreset('custom')
                setTo(e.target.value)
              }}
            />
          </div>

          <div className="es-col" style={{ minWidth: 260 }}>
            <label className="es-label">Wyszukaj metodę</label>
            <input
              className="tss-input tss-input--search"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Norma / nr metody / nazwa…"
            />
          </div>

          <div className="es-col" style={{ minWidth: 220 }}>
            <label className="es-label">Akredytacja</label>
            <select
              className="tss-select"
              value={accrFilter}
              onChange={(e) => setAccrFilter(e.target.value)}
            >
              <option value="wszystkie">Wszystkie</option>
              <option value="akredytowane">Akredytowane</option>
              <option value="nieakredytowane">Nieakredytowane</option>
            </select>
          </div>
        </div>
      </SummaryCard>
    </SummarySection>
  )
}

TestsFilters.propTypes = {
  filter: PropTypes.string,
  setFilter: PropTypes.func,
  accrFilter: PropTypes.string,
  setAccrFilter: PropTypes.func,

  rangePreset: PropTypes.string,
  setRangePreset: PropTypes.func,
  from: PropTypes.string,
  setFrom: PropTypes.func,
  to: PropTypes.string,
  setTo: PropTypes.func,

  onReset: PropTypes.func,
}

export default memo(TestsFilters)