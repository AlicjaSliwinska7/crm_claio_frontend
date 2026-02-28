// src/features/equipment/components/EquipmentSummary/EquipmentFilters.jsx
import React, { memo } from 'react'
import PropTypes from 'prop-types'
import { SlidersHorizontal } from 'lucide-react'

import { SummarySection, SummaryCard, SummaryHeader } from '../../../../shared/summaries'

import RangeControls from './RangeControls'

function EquipmentFilters(props) {
  return (
    <SummarySection className="es-section">
      <SummaryCard className="es-card">
        <SummaryHeader
          title="Filtry & Zakres"
          icon={<SlidersHorizontal className="es-headIcon" aria-hidden="true" />}
        />

        <RangeControls {...props} />
      </SummaryCard>
    </SummarySection>
  )
}

EquipmentFilters.propTypes = {
  preset: PropTypes.string,
  setPreset: PropTypes.func,
  customFrom: PropTypes.string,
  setCustomFrom: PropTypes.func,
  customTo: PropTypes.string,
  setCustomTo: PropTypes.func,

  category: PropTypes.string,
  setCategory: PropTypes.func,
  kind: PropTypes.string,
  setKind: PropTypes.func,

  labsAll: PropTypes.array,
  selectedLabs: PropTypes.array,
  setSelectedLabs: PropTypes.func,

  activeRangeText: PropTypes.string,
}

export default memo(EquipmentFilters)