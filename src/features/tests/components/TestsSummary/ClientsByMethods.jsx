// src/features/tests/components/TestsSummary/ClientsByMethods.jsx
import React, { memo, useMemo } from 'react'
import PropTypes from 'prop-types'
import { BarChart3 as BarIcon } from 'lucide-react'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts'

import { SummarySection, SummaryCard, SummaryHeader } from '../../../../shared/summaries'

function ClientsByMethods({ series = [], methodKey }) {
  const data = useMemo(() => {
    const safe = Array.isArray(series) ? series : []
    const m = new Map() // method -> Set(clients)
    for (const e of safe) {
      const k = methodKey ? methodKey(e.methodId) : e.methodId
      if (!k) continue
      if (!m.has(k)) m.set(k, new Set())
      if (e.client) m.get(k).add(String(e.client))
    }
    return Array.from(m.entries())
      .map(([name, set]) => ({ name, clients: set.size }))
      .sort((a, b) => b.clients - a.clients)
      .slice(0, 12)
  }, [series, methodKey])

  return (
    <SummarySection className="es-section">
      <SummaryCard className="es-card">
        <SummaryHeader title="Wykres — klienci per metoda (Top 12)" icon={<BarIcon className="es-headIcon" aria-hidden />} />
        <div className="ts-chart big">
          {data.length ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-25} textAnchor="end" height={60} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="clients" />
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

ClientsByMethods.propTypes = {
  series: PropTypes.array,
  methodKey: PropTypes.func,
}

export default memo(ClientsByMethods)