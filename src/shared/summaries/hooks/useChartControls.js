import { useState } from 'react'

export default function useChartControls({
  defaultType = 'grouped',
  defaultMetric = null,
  defaultAsPercent = false,
  defaultShowTotals = false,
} = {}) {
  const [chartType, setChartType] = useState(defaultType)
  const [metric, setMetric] = useState(defaultMetric)
  const [asPercent, setAsPercent] = useState(defaultAsPercent)
  const [showTotals, setShowTotals] = useState(defaultShowTotals)
  return { chartType, setChartType, metric, setMetric, asPercent, setAsPercent, showTotals, setShowTotals }
}
