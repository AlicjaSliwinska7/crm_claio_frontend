// src/features/equipment/pages/EquipmentSummary.jsx
import React, { useMemo, useState } from 'react'
import '../styles/equipment-summary.css'

// komponenty sekcyjne
import RangeControls from '../components/EquipmentSummary/RangeControls'
import Kpis from '../components/EquipmentSummary/Kpis'
import GanttCalibrations from '../components/EquipmentSummary/GanttCalibrations'
import CostsSection from '../components/EquipmentSummary/CostsSection'
import FailuresChart from '../components/EquipmentSummary/FailuresChart'

// helpery / mock
import {
  DAY,
  toTs,
  fmtDate,
  computePresetRange,
  makeGanttRowsFromNormalized,
  sampleCalibrations,
  sampleFailures,
} from '../components/EquipmentSummary/helpers'

export default function EquipmentSummary({ calibrations = sampleCalibrations, failures = sampleFailures }) {
  // === filtry / zakres ===
  const [preset, setPreset] = useState('all') // all | year | month | week | custom
  const [customFrom, setCustomFrom] = useState('')
  const [customTo, setCustomTo] = useState('')

  // dodatkowe filtry domenowe
  const [category, setCategory] = useState('all') // np. "termometry", "wagi", ...
  const [kind, setKind] = useState('all')         // np. "zewn", "wewn"
  const [selectedLabs, setSelectedLabs] = useState([]) // array stringów (nazwy labów)

  // zakres czasu (obiekt + [fromTs, toTs])
  const { from, to, labelHTML } = useMemo(
    () => computePresetRange(preset, { today: new Date(), customFrom, customTo }),
    [preset, customFrom, customTo]
  )
  const rangeTs = useMemo(() => {
    const f = from ? toTs(from) : null
    const t = to ? toTs(to) : null
    return f != null && t != null ? [f, t] : null
  }, [from, to])

  // === normalizacja danych wejściowych ===
  const calNrm = useMemo(() => {
    if (!Array.isArray(calibrations)) return []
    return calibrations
      .map(c => {
        const startTs = toTs(c.start)
        const endTs = toTs(c.end)
        return startTs != null && endTs != null && endTs >= startTs
          ? {
              ...c,
              startTs,
              endTs,
              costNum: Number(c.cost) || 0,
              lab: c.lab || '—',
            }
          : null
      })
      .filter(Boolean)
  }, [calibrations])

  const failNrm = useMemo(() => {
    if (!Array.isArray(failures)) return []
    return failures
      .map(f => {
        const dateTs = toTs(f.date)
        return dateTs != null
          ? {
              ...f,
              dateTs,
              downtimeNum: Number(f.downtimeHours) || 0,
              repairNum: Number(f.repairCost) || 0,
            }
          : null
      })
      .filter(Boolean)
      .sort((a, b) => a.dateTs - b.dateTs)
  }, [failures])

  // === zasilenie listy laboratoriów do filtra ===
  const labsAll = useMemo(() => {
    const set = new Set()
    for (const c of calNrm) set.add(c.lab || '—')
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'pl'))
  }, [calNrm])

  // === filtracja po zakresie i domenie (category/kind/labs) ===
  const filteredCal = useMemo(() => {
    const [fromTs, toTsVal] = rangeTs || []
    const hasLabsFilter = Array.isArray(selectedLabs) && selectedLabs.length > 0

    return calNrm.filter(c => {
      // zakres czasowy
      if (rangeTs && !(c.endTs >= fromTs && c.startTs <= toTsVal)) return false
      // filtr kategorii
      if (category !== 'all' && c.category !== category) return false
      // filtr rodzaju / typu
      if (kind !== 'all' && c.kind !== kind) return false
      // filtr laboratoriów
      if (hasLabsFilter && !selectedLabs.includes(c.lab || '—')) return false
      return true
    })
  }, [calNrm, rangeTs, category, kind, selectedLabs])

  const filteredFail = useMemo(() => {
    const [fromTs, toTsVal] = rangeTs || []
    return failNrm.filter(f => {
      if (rangeTs && !(f.dateTs >= fromTs && f.dateTs <= toTsVal)) return false
      // (opcjonalnie) domenowe filtry też można tu spiąć, jeśli awarie mają category/kind
      return true
    })
  }, [failNrm, rangeTs])

  // === KPI summary ===
  const summaryRaw = useMemo(() => {
    const calCount = filteredCal.length
    const devices = new Set(filteredCal.map(c => c.device || '—')).size
    const labs = new Set(filteredCal.map(c => c.lab || '—')).size

    let calCost = 0
    let calDurSum = 0
    let calDurN = 0
    for (const c of filteredCal) {
      calCost += c.costNum || 0
      const durDays = (c.endTs - c.startTs) / DAY
      if (durDays >= 0) {
        calDurSum += durDays
        calDurN += 1
      }
    }
    const calAvgDays = calDurN ? calDurSum / calDurN : 0

    const failCount = filteredFail.length
    let downSum = 0
    let repairSum = 0
    for (const f of filteredFail) {
      downSum += f.downtimeNum || 0
      repairSum += f.repairNum || 0
    }
    const downAvg = failCount ? downSum / failCount : 0

    return {
      calCount,
      devices,
      labs,
      calCost,
      calAvgDays,
      failCount,
      downSum,
      downAvg,
      repairSum,
    }
  }, [filteredCal, filteredFail])

  // formatery KPI → stringi
  const INT_FMT = useMemo(() => new Intl.NumberFormat('pl-PL'), [])
  const PLN_FMT = useMemo(
    () =>
      new Intl.NumberFormat('pl-PL', {
        style: 'currency',
        currency: 'PLN',
        maximumFractionDigits: 0,
      }),
    []
  )

  const summary = useMemo(
    () => ({
      calCount: INT_FMT.format(summaryRaw.calCount),
      devices: INT_FMT.format(summaryRaw.devices),
      labs: INT_FMT.format(summaryRaw.labs),
      calCostFormatted: PLN_FMT.format(summaryRaw.calCost),
      calAvgDaysFormatted: summaryRaw.calAvgDays.toFixed(1),
      failCount: INT_FMT.format(summaryRaw.failCount),
      downSumFormatted: INT_FMT.format(summaryRaw.downSum) + 'h',
      downAvgFormatted: summaryRaw.downAvg.toFixed(1) + 'h',
      repairSumFormatted: PLN_FMT.format(summaryRaw.repairSum),
    }),
    [summaryRaw, INT_FMT, PLN_FMT]
  )

  // === wykresy ===
  const gantt = useMemo(() => makeGanttRowsFromNormalized(filteredCal), [filteredCal])

  const failuresChart = useMemo(() => {
    if (!filteredFail.length) return { domain: ['auto', 'auto'], data: [] }
    const min = filteredFail[0].dateTs
    const max = filteredFail[filteredFail.length - 1].dateTs
    return { domain: [min, max], data: filteredFail }
  }, [filteredFail])

  // === lista laboratoriów do CostsSection (kolejność alfabetyczna) ===
  const labsList = useMemo(() => {
    const set = new Set()
    for (const c of filteredCal) set.add(c.lab || '—')
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'pl'))
  }, [filteredCal])

  // === tekst aktywnego zakresu (używany nad filtrami) ===
  const activeRangeText =
    preset === 'custom' && (!customFrom || !customTo)
      ? 'Aktywny zakres: wszystkie'
      : rangeTs
      ? `Aktywny zakres: ${fmtDate(rangeTs[0])} – ${fmtDate(rangeTs[1])}`
      : 'Aktywny zakres: wszystkie'

  return (
    <div className='es-root'>
      {/* -------- FILTRY & ZAKRES -------- */}
      <div className='es-card es-section'>
        <div className='es-card__sectionHead'>
          <i className='fa-solid fa-sliders' aria-hidden='true' />
          <h3 className='es-card__sectionTitle'>Filtry & Zakres</h3>
        </div>

        <RangeControls
          // zakres
          preset={preset}
          setPreset={setPreset}
          customFrom={customFrom}
          setCustomFrom={setCustomFrom}
          customTo={customTo}
          setCustomTo={setCustomTo}
          // domena
          category={category}
          setCategory={setCategory}
          kind={kind}
          setKind={setKind}
          // LABORATORIA (NOWE)
          labsAll={labsAll}
          selectedLabs={selectedLabs}
          setSelectedLabs={setSelectedLabs}
          // tekst zakresu
          activeRangeText={activeRangeText}
        />
      </div>

      {/* -------- PODSUMOWANIE / KPI -------- */}
      <Kpis kpis={summary} />

      {/* -------- GANTT -------- */}
      <GanttCalibrations gantt={gantt} />

      {/* -------- KOSZTY -------- */}
      <CostsSection filteredCal={filteredCal} labsList={labsList} />

      {/* -------- AWARYJNOŚĆ -------- */}
      <FailuresChart failuresChart={failuresChart} />
    </div>
  )
}
