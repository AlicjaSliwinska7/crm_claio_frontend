// src/features/equipment/pages/EquipmentSummary.jsx
import React, { useMemo, useState } from 'react'
import '../styles/equipment-summary.css'

import EquipmentFilters from '../components/EquipmentSummary/EquipmentFilters'
import Kpis from '../components/EquipmentSummary/Kpis'
import SummaryChartBlock from '../components/EquipmentSummary/SummaryChartBlock'

import equipmentSummaryMock from '../components/EquipmentSummary/equipmentSummary.mock'
import { fmtDate } from '../components/EquipmentSummary/time.js'
import { computePresetRange } from '../components/EquipmentSummary/range'

import { equipmentSummaryConfig } from '../config/equipmentSummary.config'

const { sampleCalibrations, sampleFailures } = equipmentSummaryMock

export default function EquipmentSummary({
  calibrations = sampleCalibrations,
  failures = sampleFailures,
}) {
  // ─────────────────────────────────────────────
  // STATE: filtry / zakres
  // ─────────────────────────────────────────────
  const [preset, setPreset] = useState('all')
  const [customFrom, setCustomFrom] = useState('')
  const [customTo, setCustomTo] = useState('')

  const [category, setCategory] = useState('all')
  const [kind, setKind] = useState('all')
  const [selectedLabs, setSelectedLabs] = useState([])

  // ─────────────────────────────────────────────
  // RANGE: { from, to } + { fromTs, toTs }
  // ─────────────────────────────────────────────
  const range = useMemo(
    () => computePresetRange(preset, { today: new Date(), customFrom, customTo }),
    [preset, customFrom, customTo]
  )

  const rangeObj = useMemo(() => {
    const fromTs = range?.from ? Number(range.from) : null
    const toTsVal = range?.to ? Number(range.to) : null

    // computePresetRange w Twoim przypadku zwraca zwykle Date/string,
    // ale część helperów w projekcie używała toTs() - tu trzymamy się tego,
    // co już w praktyce działa: fmtDate dostaje TS.
    // Jeśli range.from/to są Date -> Number(Date) = ts.
    const f = Number.isFinite(fromTs) ? fromTs : null
    const t = Number.isFinite(toTsVal) ? toTsVal : null

    return { fromTs: f, toTs: t }
  }, [range])

  const hasCustomMissing =
    preset === 'custom' && (!customFrom || !customTo)

  const activeRangeText = useMemo(() => {
    if (hasCustomMissing) return 'Aktywny zakres: wszystkie'
    if (rangeObj?.fromTs && rangeObj?.toTs) {
      return `Aktywny zakres: ${fmtDate(rangeObj.fromTs)} – ${fmtDate(rangeObj.toTs)}`
    }
    return 'Aktywny zakres: wszystkie'
  }, [hasCustomMissing, rangeObj])

  // ─────────────────────────────────────────────
  // PIPELINE: normalize -> filter -> kpis -> sections
  // ─────────────────────────────────────────────
  const normalized = useMemo(() => {
    return equipmentSummaryConfig.compute.normalize({
      sources: { calibrations, failures },
    })
  }, [calibrations, failures])

  const filtered = useMemo(() => {
    return equipmentSummaryConfig.compute.filter({
      normalized,
      range: rangeObj,
      filters: { category, kind, labs: selectedLabs },
    })
  }, [normalized, rangeObj, category, kind, selectedLabs])

  const kpis = useMemo(() => {
    return equipmentSummaryConfig.compute.kpis({ filtered })
  }, [filtered])

  const sectionData = useMemo(() => {
    return equipmentSummaryConfig.compute.sections({
      filtered,
      range: rangeObj,
    })
  }, [filtered, rangeObj])

  // ─────────────────────────────────────────────
  // LABS: options for filter
  // ─────────────────────────────────────────────
  const labsAll = useMemo(() => {
    const cal = Array.isArray(normalized?.calibrations) ? normalized.calibrations : []
    const set = new Set()
    for (const c of cal) set.add(c.lab || '—')
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'pl'))
  }, [normalized])

  // ─────────────────────────────────────────────
  // SECTIONS: pick once from config
  // ─────────────────────────────────────────────
  const ganttSection = equipmentSummaryConfig.sections.find((s) => s.id === 'gantt') || null
  const costsSection = equipmentSummaryConfig.sections.find((s) => s.id === 'costs') || null
  const failuresSection = equipmentSummaryConfig.sections.find((s) => s.id === 'failures') || null

  return (
    <div className="equipment-summary es-root">
      {/* -------- FILTRY & ZAKRES -------- */}
      <EquipmentFilters
        preset={preset}
        setPreset={setPreset}
        customFrom={customFrom}
        setCustomFrom={setCustomFrom}
        customTo={customTo}
        setCustomTo={setCustomTo}
        category={category}
        setCategory={setCategory}
        kind={kind}
        setKind={setKind}
        labsAll={labsAll}
        selectedLabs={selectedLabs}
        setSelectedLabs={setSelectedLabs}
        activeRangeText={activeRangeText}
      />

      {/* -------- PODSUMOWANIE / KPI -------- */}
      <Kpis kpis={kpis} />

      {/* -------- WYKRESY (chartBlock) -------- */}
      <SummaryChartBlock section={ganttSection} sectionData={sectionData} />
      <SummaryChartBlock section={costsSection} sectionData={sectionData} />
      <SummaryChartBlock section={failuresSection} sectionData={sectionData} />
    </div>
  )
}