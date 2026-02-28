// src/shared/summaries/kpi/kpiRegistry.js
import { fmtIntPL, fmt1, fmtPLN0, fmtDatePL } from '../utils/kpiFormatters'

/**
 * Każdy builder zwraca tablicę items[] dla SummaryKpiGrid:
 * { key, label, value, sub? }
 *
 * ctx powinno zawierać przynajmniej:
 * - totals (obiekt KPI)
 * - fmtPLN (opcjonalnie)
 */
function moneyOf(ctx) {
  return typeof ctx?.fmtPLN === 'function' ? ctx.fmtPLN : fmtPLN0
}

/* =========================
   TESTS
   ========================= */
function testsKpis(ctx) {
  const t = ctx?.totals || {}
  const money = moneyOf(ctx)

  return [
    // rząd 1
    { key: 'methods', label: 'Metody', value: fmtIntPL(t.methods) },
    { key: 'acc', label: 'Akredytowane', value: fmtIntPL(t.accCnt) },
    { key: 'nonacc', label: 'Nieakredytowane', value: fmtIntPL(t.nonAcc) },
    { key: 'labor', label: 'Koszt RH', value: money(t.labor) },
    { key: 'tat', label: 'Śr. czas [dni]', value: fmt1(t.tatWeighted) },

    // rząd 2
    { key: 'tests', label: 'Badania', value: fmtIntPL(t.tests) },
    { key: 'samples', label: 'Próbki', value: fmtIntPL(t.samples) },
    { key: 'revenue', label: 'Przychód', value: money(t.revenue) },
    { key: 'margin', label: 'Marża', value: money(t.margin) },
    { key: 'range', label: 'Zakres (ostatnie wykon.)', value: `${fmtDatePL(t.lastFrom)} – ${fmtDatePL(t.lastTo)}` },
  ]
}

/* =========================
   EQUIPMENT / SAMPLES / SALES
   (placeholdery, żeby od razu było SSOT; dopasujemy pola totals
   kiedy podepniesz KPI na tych stronach)
   ========================= */

// ... na górze pliku zostaje bez zmian

/* =========================
   EQUIPMENT (1:1 z equipmentSummaryConfig.compute.kpis)
   ========================= */

function equipmentKpis(ctx) {
  const t = ctx?.totals || {}

  // defensywnie: jeśli coś nie przyjdzie, pokażemy "0"/"0h"/"0.0"
  const s = (v, fallback = '0') => (v == null || v === '' ? fallback : String(v))

  return [
    // 1 rząd
    { key: 'calCount', label: 'Wzorcowania', value: s(t.calCount, '0') },
    { key: 'devices', label: 'Sprzęt', value: s(t.devices, '0') },
    { key: 'labs', label: 'Laboratoria', value: s(t.labs, '0') },
    { key: 'calCostFormatted', label: 'Koszt wzorcowań', value: s(t.calCostFormatted, '0 zł') },
    { key: 'calAvgDaysFormatted', label: 'Śr. czas (dni)', value: s(t.calAvgDaysFormatted, '0.0') },

    // 2 rząd
    { key: 'failCount', label: 'Awarie', value: s(t.failCount, '0') },
    { key: 'downSumFormatted', label: 'Przestoje', value: s(t.downSumFormatted, '0h') },
    { key: 'downAvgFormatted', label: 'Śr. przestój', value: s(t.downAvgFormatted, '0.0h') },
    { key: 'repairSumFormatted', label: 'Koszt napraw', value: s(t.repairSumFormatted, '0 zł') },
  ]
}

function samplesKpis(ctx) {
  const t = ctx?.totals || {}
  return [
    { key: 'samples', label: 'Próbki', value: fmtIntPL(t.samples) },
    { key: 'registered', label: 'Zarejestrowane', value: fmtIntPL(t.registered) },
    { key: 'inProgress', label: 'W trakcie', value: fmtIntPL(t.inProgress) },
    { key: 'toReturn', label: 'Do zwrotu', value: fmtIntPL(t.toReturn) },
    { key: 'toDispose', label: 'Do utylizacji', value: fmtIntPL(t.toDispose) },
  ]
}

function salesKpis(ctx) {
  const t = ctx?.totals || {}
  const money = moneyOf(ctx)

  return [
    { key: 'offers', label: 'Oferty', value: fmtIntPL(t.offers) },
    { key: 'orders', label: 'Zlecenia', value: fmtIntPL(t.orders) },
    { key: 'won', label: 'Przyjęte', value: fmtIntPL(t.won) },
    { key: 'lost', label: 'Odrzucone', value: fmtIntPL(t.lost) },
    { key: 'sum', label: 'Wartość', value: money(t.totalValue ?? t.sum) },
  ]
}

/* =========================
   Registry + Public API
   ========================= */

const REGISTRY = {
  tests: testsKpis,
  equipment: equipmentKpis,
  samples: samplesKpis,
  sales: salesKpis,
}

/**
 * getKpiItems(moduleKey, ctx)
 * moduleKey: 'tests' | 'equipment' | 'samples' | 'sales' ...
 */
export function getKpiItems(moduleKey, ctx) {
  const fn = REGISTRY[moduleKey]
  if (!fn) return []
  try {
    return fn(ctx) || []
  } catch (e) {
    // defensywnie: nie wysyp strony jeśli totals ma inne pola
    return []
  }
}

/** (opcjonalnie) export do debugowania/rozszerzania */
export const kpiRegistry = REGISTRY
// w src/shared/summaries/kpi/kpiRegistry.js

