// src/features/tests/components/TestsSummary/KPIs.jsx
import React, { memo, useMemo } from 'react'
import PropTypes from 'prop-types'
import { BarChart3 } from 'lucide-react'

import {
  SummarySection,
  SummaryCard,
  SummaryHeader,
  SummaryKpiGrid,
  getKpiItems,
} from '../../../../shared/summaries'

function KPIs({ totals, fmtPLN }) {
  // ctx dla registry: trzymamy minimalnie
  const ctx = useMemo(() => ({ totals, fmtPLN }), [totals, fmtPLN])
  const items = useMemo(() => getKpiItems('tests', ctx), [ctx])

  return (
    <SummarySection className="es-section">
      <SummaryCard className="es-card">
        <SummaryHeader title="Podsumowanie" icon={<BarChart3 className="es-headIcon" aria-hidden="true" />} />
        <SummaryKpiGrid items={items} columns={5} />
      </SummaryCard>
    </SummarySection>
  )
}

KPIs.propTypes = {
  totals: PropTypes.object,
  fmtPLN: PropTypes.func,
}

export default memo(KPIs)