import React, { memo, useMemo } from 'react'
import PropTypes from 'prop-types'
import { Wrench } from 'lucide-react'

import {
  SummarySection,
  SummaryCard,
  SummaryHeader,
  SummaryKpiGrid,
  getKpiItems,
} from '../../../../shared/summaries'

function Kpis({ kpis, fmtPLN }) {
  const ctx = useMemo(() => ({ totals: kpis || {}, fmtPLN }), [kpis, fmtPLN])
  const items = useMemo(() => getKpiItems('equipment', ctx), [ctx])

  return (
    <SummarySection className="es-section">
      <SummaryCard className="es-card">
        <SummaryHeader title="Podsumowanie" icon={<Wrench className="es-headIcon" aria-hidden="true" />} />
        {/* 9 kafelków => 5 w 1 rzędzie, 4 w 2 */}
        <SummaryKpiGrid items={items} columns={5} />
      </SummaryCard>
    </SummarySection>
  )
}

Kpis.propTypes = {
  kpis: PropTypes.object,
  fmtPLN: PropTypes.func,
}

export default memo(Kpis)