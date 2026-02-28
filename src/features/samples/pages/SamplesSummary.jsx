// src/features/samples/pages/SamplesSummary.jsx
import React, { useMemo, useState } from 'react'

import { SummaryRoot } from '../../../shared/summaries'
import { SummarySection, SummaryCard, SummaryHeader } from '../../../shared/summaries'
import { Filter } from 'lucide-react'

import { samplesSummaryConfig } from '../config/samplesSummary.config'

/**
 * Cel: cienki kontener Summary -> Filtry / Wykresy / Tabela jako osobne sekcje.
 * Dane: demo (do podmiany backendem).
 */

const DEMO_SAMPLES = [
  {
    id: 'S-001',
    code: 'AO',
    client: 'GreenEnergy S.A.',
    subject: 'Ogniwo Li-Ion',
    receivedDate: '2026-01-10',
    completedDate: '2026-01-22',
    energyWh: 520,
    capacityAh: 42,
    voltageV: 12.1,
    currentA: 8.4,
  },
  {
    id: 'S-002',
    code: 'AZ',
    client: 'TechSolutions Sp. z o.o.',
    subject: 'Moduł bateryjny',
    receivedDate: '2026-01-12',
    completedDate: '2026-02-02',
    energyWh: 860,
    capacityAh: 60,
    voltageV: 24.0,
    currentA: 12.5,
  },
  {
    id: 'S-003',
    code: 'BP',
    client: 'Meditech Polska',
    subject: 'Zasilacz UPS',
    receivedDate: '2026-02-01',
    completedDate: '2026-02-18',
    energyWh: 310,
    capacityAh: 18,
    voltageV: 11.8,
    currentA: 6.2,
  },
  {
    id: 'S-004',
    code: 'BW',
    client: 'GreenEnergy S.A.',
    subject: 'Pakiet testowy',
    receivedDate: '2026-02-10',
    completedDate: '2026-02-20',
    energyWh: 430,
    capacityAh: 33,
    voltageV: 12.0,
    currentA: 7.1,
  },
]

function FiltersSection({ state, setState, unique }) {
  return (
    <SummarySection className="es-section">
      <SummaryCard className="es-card">
        <SummaryHeader title="Filtry główne" icon={<Filter className="es-headIcon" aria-hidden="true" />} />

        <div className="es-panel-controls">
          <div className="es-col">
            <label className="es-label">Zakres dat (received)</label>
            <div className="ts-inline">
              <input
                className="tss-input tss-input--date"
                type="date"
                value={state.from}
                onChange={(e) => setState((p) => ({ ...p, from: e.target.value }))}
              />
              <input
                className="tss-input tss-input--date"
                type="date"
                value={state.to}
                onChange={(e) => setState((p) => ({ ...p, to: e.target.value }))}
              />
            </div>
          </div>

          <div className="es-col">
            <label className="es-label">Kod</label>
            <select
              className="es-select"
              value={state.code}
              onChange={(e) => setState((p) => ({ ...p, code: e.target.value }))}
            >
              <option value="">Wszystkie</option>
              {unique.codes.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="es-col">
            <label className="es-label">Klient</label>
            <select
              className="es-select"
              value={state.client}
              onChange={(e) => setState((p) => ({ ...p, client: e.target.value }))}
            >
              <option value="">Wszyscy</option>
              {unique.clients.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="es-col">
            <label className="es-label">Grupowanie</label>
            <select
              className="es-select"
              value={state.groupBy}
              onChange={(e) => setState((p) => ({ ...p, groupBy: e.target.value }))}
            >
              <option value="byCode">Po kodzie</option>
              <option value="bySubject">Po przedmiocie</option>
              <option value="byClient">Po kliencie</option>
            </select>
          </div>

          <div className="es-col es-col--actions">
            <button
              type="button"
              className="tss-btn"
              onClick={() => setState({ from: '', to: '', code: '', client: '', groupBy: 'byCode' })}
              title="Wyczyść filtry"
            >
              Wyczyść
            </button>
          </div>
        </div>
      </SummaryCard>
    </SummarySection>
  )
}

function ChartsSection({ chart }) {
  return (
    <SummarySection className="es-section">
      <SummaryCard className="es-card">
        <SummaryHeader title="Wykresy" />
        <div className="tss-empty">
          (W tej wersji zostawiam miejsce — w kolejnym kroku podepniemy wykresy z `shared/diagrams`
          na podstawie `chart.keys/chart.data` z configu.)
        </div>
        <pre style={{ fontSize: 12, opacity: 0.85, overflow: 'auto' }}>
{JSON.stringify({ keys: chart?.keys, rows: chart?.data?.length }, null, 2)}
        </pre>
      </SummaryCard>
    </SummarySection>
  )
}

function TableSection({ table }) {
  const cols = table?.columns || []
  const rows = table?.rows || []

  return (
    <SummarySection className="es-section">
      <SummaryCard className="es-card">
        <SummaryHeader title="Tabela główna" />

        <div className="tss-table-wrap">
          <table className="tss-table">
            <thead>
              <tr>
                {cols.map((c) => (
                  <th key={c.key || c.label}>{c.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.length ? (
                rows.map((r, idx) => (
                  <tr key={r.id || r.group || idx}>
                    {cols.map((c) => (
                      <td key={c.key || c.label}>{r[c.key] ?? '—'}</td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="tss-empty" colSpan={cols.length || 1}>
                    Brak danych.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </SummaryCard>
    </SummarySection>
  )
}

export default function SamplesSummary({ samples }) {
  const data = useMemo(() => (Array.isArray(samples) && samples.length ? samples : DEMO_SAMPLES), [samples])

  const unique = useMemo(() => {
    const codes = Array.from(new Set(data.map((x) => x.code).filter(Boolean))).sort()
    const clients = Array.from(new Set(data.map((x) => x.client).filter(Boolean))).sort((a, b) => a.localeCompare(b, 'pl'))
    return { codes, clients }
  }, [data])

  const [state, setState] = useState({
    from: '',
    to: '',
    code: '',
    client: '',
    groupBy: 'byCode',
  })

  const filtered = useMemo(() => {
    return data.filter((s) => {
      const d = (s.receivedDate || '').slice(0, 10)
      if (state.from && (!d || d < state.from)) return false
      if (state.to && (!d || d > state.to)) return false
      if (state.code && s.code !== state.code) return false
      if (state.client && s.client !== state.client) return false
      return true
    })
  }, [data, state])

  const kpis = useMemo(() => samplesSummaryConfig.compute.kpis({ filtered }), [filtered])
  const chart = useMemo(() => samplesSummaryConfig.compute.charts({ filtered, groupBy: state.groupBy, seriesLimit: 6 }), [filtered, state.groupBy])
  const table = useMemo(() => samplesSummaryConfig.compute.table({ filtered, groupBy: state.groupBy }), [filtered, state.groupBy])

  return (
    <SummaryRoot className="samples-summary es-root">
      <FiltersSection state={state} setState={setState} unique={unique} />

      <SummarySection className="es-section">
        <SummaryCard className="es-card">
          <SummaryHeader title="KPI" />
          <div className="tss-card tss-kpis">
            <div className="tss-kpis__row">
              <strong>Próbek:</strong> {kpis.count}
              <span className="tss-sep">•</span>
              <strong>Klientów:</strong> {kpis.clientsCount}
              <span className="tss-sep">•</span>
              <strong>Przedmiotów:</strong> {kpis.subjectsCount}
            </div>
            <div className="tss-kpis__sub">
              Zakres: <span className="muted">{kpis.rangeStr}</span>
            </div>
          </div>
        </SummaryCard>
      </SummarySection>

      <ChartsSection chart={chart} />
      <TableSection table={table} />
    </SummaryRoot>
  )
}