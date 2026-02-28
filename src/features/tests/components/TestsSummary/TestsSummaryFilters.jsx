// src/features/tests/components/TestsSummary/TestsSummaryFilters.jsx
import React, { memo } from 'react'
import PropTypes from 'prop-types'
import { Filter, Search } from 'lucide-react'

import {
  SummarySection,
  SummaryCard,
  SummaryHeader,
  SummaryControls,
} from '../../../../shared/summaries'

function TestsSummaryFilters({
  filter,
  setFilter,
  accrFilter,
  setAccrFilter,
  title = 'Filtry główne',
}) {
  return (
    <SummarySection className="es-section">
      <SummaryCard className="es-card">
        <SummaryHeader
          title={title}
          icon={<Filter className="es-headIcon" aria-hidden="true" />}
        />

        <SummaryControls className="es-panel-controls">
          <div className="es-col" style={{ width: 340 }}>
            <label className="es-label" htmlFor="methods-search">
              Szukaj normy / metody
            </label>

            <div className="tss-search__box tss-search__box--limit">
              <span className="tss-search__icon" aria-hidden="true">
                <Search size={16} />
              </span>

              <input
                id="methods-search"
                type="text"
                className="tss-input tss-input--search"
                placeholder="np. ISO 527 lub PB-101"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                name="methods-search"
                aria-label="Szukaj metody badawczej"
              />
            </div>
          </div>

          <div className="es-col" style={{ width: 200 }}>
            <label className="es-label" htmlFor="accr-filter">
              Akredytacja
            </label>

            <select
              id="accr-filter"
              className="tss-select"
              title="Filtr akredytacji"
              value={accrFilter}
              onChange={(e) => setAccrFilter(e.target.value)}
            >
              <option value="wszystkie">Wszystkie</option>
              <option value="akredytowane">Akredytowane</option>
              <option value="nieakredytowane">Nieakredytowane</option>
            </select>
          </div>
        </SummaryControls>
      </SummaryCard>
    </SummarySection>
  )
}

TestsSummaryFilters.propTypes = {
  title: PropTypes.string,
  filter: PropTypes.string,
  setFilter: PropTypes.func,
  accrFilter: PropTypes.string,
  setAccrFilter: PropTypes.func,
}

export default memo(TestsSummaryFilters)