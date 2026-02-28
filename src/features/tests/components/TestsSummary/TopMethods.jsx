// src/features/tests/components/TestsSummary/TopMethods.jsx
import React, { memo, useMemo } from 'react'
import PropTypes from 'prop-types'
import { BarChartHorizontal as BarIcon } from 'lucide-react'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts'

import { SummarySection, SummaryCard, SummaryHeader } from '../../../../shared/summaries'

function TopMethods({ series = [], methodKey }) {
  const data = useMemo(() => {
    const safe = Array.isArray(series) ? series : []
    const m = new Map()
    for (const e of safe) {
      const name = methodKey ? methodKey(e.methodId) : e.methodId
      if (!name) continue
      m.set(name, (m.get(name) || 0) + (Number(e.testsCount) || 0))
    }
    return Array.from(m.entries())
      .map(([name, tests]) => ({ name, tests }))
      .sort((a, b) => b.tests - a.tests)
      .slice(0, 12)
  }, [series, methodKey])

  return (
    <SummarySection className="es-section">
      <SummaryCard className="es-card">
        <SummaryHeader title="Wykres — Top metody (liczba badań)" icon={<BarIcon className="es-headIcon" aria-hidden />} />
        <div className="ts-chart big">
          {data.length ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={data} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" allowDecimals={false} />
                <YAxis type="category" dataKey="name" width={140} />
                <Tooltip />
                <Legend />
                <Bar dataKey="tests" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="tss-empty">Brak danych do wykresu.</div>
          )}
        </div>
      </SummaryCard>
    </SummarySection>
  )
}

TopMethods.propTypes = {
  series: PropTypes.array,
  methodKey: PropTypes.func,
}

export default memo(TopMethods)