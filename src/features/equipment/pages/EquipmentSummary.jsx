// src/features/equipment/pages/EquipmentSummary.jsx
import React, { useMemo, useState } from 'react'
import '../styles/equipment-summary.css'

// komponenty sekcyjne (na razie zostają feature-specific)
import RangeControls from '../components/EquipmentSummary/RangeControls'
import Kpis from '../components/EquipmentSummary/Kpis'

// shared: mock + utils
import equipmentSummaryMock from '../components/EquipmentSummary/equipmentSummary.mock'
import { toTs, fmtDate } from '../components/EquipmentSummary/time.js'
import { computePresetRange } from '../components/EquipmentSummary/range'

// ✅ config (pipeline normalize/filter/kpis/sections)
import { equipmentSummaryConfig } from '../config/equipmentSummary.config'

// ✅ wspólny blok wykresu (UI + registry renderery)
import SummaryChartBlock from '../components/EquipmentSummary/SummaryChartBlock'

const { sampleCalibrations, sampleFailures } = equipmentSummaryMock

export default function EquipmentSummary({ calibrations = sampleCalibrations, failures = sampleFailures }) {
  // === filtry / zakres ===
  const [preset, setPreset] = useState('all')
  const [customFrom, setCustomFrom] = useState('')
  const [customTo, setCustomTo] = useState('')

  const [category, setCategory] = useState('all')
  const [kind, setKind] = useState('all')
  const [selectedLabs, setSelectedLabs] = useState([])

  // zakres czasu (obiekt + [fromTs, toTs])
  const { from, to } = useMemo(
    () => computePresetRange(preset, { today: new Date(), customFrom, customTo }),
    [preset, customFrom, customTo]
  )

  const rangeTs = useMemo(() => {
    const f = from ? toTs(from) : null
    const t = to ? toTs(to) : null
    return f != null && t != null ? [f, t] : null
  }, [from, to])

  const rangeObj = useMemo(() => {
    const [fromTs, toTsVal] = rangeTs || []
    return { fromTs: fromTs ?? null, toTs: toTsVal ?? null }
  }, [rangeTs])

  // ─────────────────────────────────────────────────────────────
  // ✅ pipeline z configu (normalize -> filter -> kpis -> sections)
  // ─────────────────────────────────────────────────────────────
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

  const kpis = useMemo(() => equipmentSummaryConfig.compute.kpis({ filtered }), [filtered])

  const sectionData = useMemo(() => {
    return equipmentSummaryConfig.compute.sections({
      filtered,
      range: rangeObj,
    })
  }, [filtered, rangeObj])

  // === zasilenie listy laboratoriów do filtra ===
  const labsAll = useMemo(() => {
    const cal = Array.isArray(normalized?.calibrations) ? normalized.calibrations : []
    const set = new Set()
    for (const c of cal) set.add(c.lab || '—')
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'pl'))
  }, [normalized])

  const activeRangeText =
    preset === 'custom' && (!customFrom || !customTo)
      ? 'Aktywny zakres: wszystkie'
      : rangeTs
      ? `Aktywny zakres: ${fmtDate(rangeTs[0])} – ${fmtDate(rangeTs[1])}`
      : 'Aktywny zakres: wszystkie'

  // ✅ sekcje chartBlock z configu
  const ganttSection = useMemo(() => equipmentSummaryConfig.sections.find(s => s.id === 'gantt'), [])
  const costsSection = useMemo(() => equipmentSummaryConfig.sections.find(s => s.id === 'costs'), [])
  const failuresSection = useMemo(() => equipmentSummaryConfig.sections.find(s => s.id === 'failures'), [])

  return (
    <div className='es-root'>
      {/* -------- FILTRY & ZAKRES -------- */}
      <div className='es-card es-section'>
        <div className='es-card__sectionHead'>
          <i className='fa-solid fa-sliders' aria-hidden='true' />
          <h3 className='es-card__sectionTitle'>Filtry & Zakres</h3>
        </div>

        <RangeControls
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
      </div>

      {/* -------- PODSUMOWANIE / KPI -------- */}
      <Kpis kpis={kpis} />

      {/* -------- GANTT (shared/diagrams) -------- */}
      <SummaryChartBlock section={ganttSection} sectionData={sectionData} />

      {/* -------- KOSZTY (shared/diagrams) -------- */}
      <SummaryChartBlock section={costsSection} sectionData={sectionData} />

      {/* -------- AWARYJNOŚĆ (shared/diagrams) -------- */}
      <SummaryChartBlock section={failuresSection} sectionData={sectionData} />
    </div>
  )
}
