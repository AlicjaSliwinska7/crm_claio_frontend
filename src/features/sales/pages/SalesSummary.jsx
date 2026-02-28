// src/features/sales/pages/SalesSummary.jsx
import React from 'react'
import { SummaryRoot, SummarySection, SummaryCard, SummaryHeader } from '../../../shared/summaries'
import { Filter, Table as TableIcon, BarChart3 } from 'lucide-react'

function SalesFilters() {
  return (
    <SummarySection className="es-section">
      <SummaryCard className="es-card">
        <SummaryHeader title="Filtry główne" icon={<Filter className="es-headIcon" aria-hidden />} />
        <div className="tss-empty">Sekcja filtrów — do podpięcia pod dane ofert / zleceń.</div>
      </SummaryCard>
    </SummarySection>
  )
}

function SalesMainTable() {
  return (
    <SummarySection className="es-section">
      <SummaryCard className="es-card">
        <SummaryHeader title="Tabela główna" icon={<TableIcon className="es-headIcon" aria-hidden />} />
        <div className="tss-empty">Tabela — do podpięcia (np. oferty wg statusu / klienci / pipeline).</div>
      </SummaryCard>
    </SummarySection>
  )
}

function SalesCharts() {
  return (
    <SummarySection className="es-section">
      <SummaryCard className="es-card">
        <SummaryHeader title="Wykresy" icon={<BarChart3 className="es-headIcon" aria-hidden />} />
        <div className="tss-empty">Wykresy — do podpięcia przez `shared/diagrams`.</div>
      </SummaryCard>
    </SummarySection>
  )
}

export default function SalesSummary() {
  return (
    <SummaryRoot className="sales-summary es-root">
      <SalesFilters />
      <SalesCharts />
      <SalesMainTable />
    </SummaryRoot>
  )
}