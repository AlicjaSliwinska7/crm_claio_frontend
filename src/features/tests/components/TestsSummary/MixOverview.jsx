// src/features/tests/components/TestsSummary/MixOverview.jsx
import React, { memo, useMemo } from 'react'
import PropTypes from 'prop-types'
import { PieChart as PieIcon } from 'lucide-react'
import { ResponsiveContainer, PieChart, Pie, Tooltip, Legend, Cell } from 'recharts'

import { SummarySection, SummaryCard, SummaryHeader } from '../../../../shared/summaries'

const monthKey = (iso) => String(iso || '').slice(0, 7)

function MixOverview({ series = [], methodKey }) {
  const data = useMemo(() => {
    const safe = Array.isArray(series) ? series : []
    const m = new Map()
    for (const e of safe) {
      const k = methodKey ? methodKey(e.methodId) : e.methodId
      if (!k) continue
      m.set(k, (m.get(k) || 0) + (Number(e.testsCount) || 0))
    }
    return Array.from(m.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10)
  }, [series, methodKey])

  return (
    <SummarySection className="es-section">
      <SummaryCard className="es-card">
        <SummaryHeader title="Wykres — mix metod (Top 10)" icon={<PieIcon className="es-headIcon" aria-hidden />} />
        <div className="ts-chart big">
          {data.length ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data} dataKey="value" nameKey="name" outerRadius={120} label>
                  {data.map((_, idx) => (
                    <Cell key={idx} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="tss-empty">Brak danych do wykresu.</div>
          )}
        </div>
      </SummaryCard>
    </SummarySection>
  )
}

MixOverview.propTypes = {
  series: PropTypes.array,
  methodKey: PropTypes.func,
}

export default memo(MixOverview)