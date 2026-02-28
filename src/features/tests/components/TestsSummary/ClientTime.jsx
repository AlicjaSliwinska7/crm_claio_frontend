// src/features/tests/components/TestsSummary/ClientTime.jsx
import React, { memo, useMemo } from 'react'
import PropTypes from 'prop-types'
import { LineChart as LineIcon } from 'lucide-react'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts'

import { SummarySection, SummaryCard, SummaryHeader } from '../../../../shared/summaries'

const monthKey = (iso) => String(iso || '').slice(0, 7)

function ClientTime({ series = [] }) {
  const data = useMemo(() => {
    const safe = Array.isArray(series) ? series : []
    const m = new Map()
    for (const e of safe) {
      const mk = monthKey(e.date)
      if (!mk) continue
      const prev = m.get(mk) || { month: mk, tests: 0, samples: 0 }
      prev.tests += Number(e.testsCount) || 0
      prev.samples += Number(e.samplesCount) || 0
      m.set(mk, prev)
    }
    return Array.from(m.values()).sort((a, b) => a.month.localeCompare(b.month))
  }, [series])

  return (
    <SummarySection className="es-section">
      <SummaryCard className="es-card">
        <SummaryHeader title="Wykres — trend miesięczny" icon={<LineIcon className="es-headIcon" aria-hidden />} />
        <div className="ts-chart big">
          {data.length ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="tests" />
                <Line type="monotone" dataKey="samples" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="tss-empty">Brak danych do wykresu.</div>
          )}
        </div>
      </SummaryCard>
    </SummarySection>
  )
}

ClientTime.propTypes = {
  series: PropTypes.array,
}

export default memo(ClientTime)