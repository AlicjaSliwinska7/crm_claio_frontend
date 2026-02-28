// src/features/tests/components/TestsSummary/StdMethodAnalysis.jsx
import React, { memo, useMemo } from 'react'
import PropTypes from 'prop-types'
import { BarChart3 as BarIcon } from 'lucide-react'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts'

import { SummarySection, SummaryCard, SummaryHeader } from '../../../../shared/summaries'

function StdMethodAnalysis({ rows = [] }) {
  const data = useMemo(() => {
    const safe = Array.isArray(rows) ? rows : []
    const m = new Map()
    for (const r of safe) {
      const std = String(r.standard || '—')
      m.set(std, (m.get(std) || 0) + 1)
    }
    return Array.from(m.entries())
      .map(([standard, methods]) => ({ standard, methods }))
      .sort((a, b) => b.methods - a.methods)
      .slice(0, 10)
  }, [rows])

  return (
    <SummarySection className="es-section">
      <SummaryCard className="es-card">
        <SummaryHeader title="Wykres — metody wg normy (Top 10)" icon={<BarIcon className="es-headIcon" aria-hidden />} />
        <div className="ts-chart big">
          {data.length ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 30 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="standard" angle={-20} textAnchor="end" height={70} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="methods" />
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

StdMethodAnalysis.propTypes = {
  rows: PropTypes.array,
}

export default memo(StdMethodAnalysis)