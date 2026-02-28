// src/features/methods/config/testingMethods.config.js
// SSOT — normy i metody badawcze (z polami pod workflow)

import { makeSearchFields } from '../../../shared/tables'
import { safeString } from '../../../shared/utils/formatters'

const s = v => safeString(v)

/* ===================== CSV ===================== */
/** Eksport „jak w tabeli” (płaskie wiersze metod). */
export const CSV_COLUMNS = [
  { key: 'standardNo', label: 'Nr normy / dokumentu' },
  { key: 'title', label: 'Tytuł' },
  { key: 'methodNo', label: 'Nr metody badawczej' },
  { key: 'accreditedText', label: 'Akredytacja' },
  { key: 'methodName', label: 'Nazwa metody badawczej' },

  // pola pod workflow
  { key: 'sampleType', label: 'Typ próbki' },
  { key: 'matrix', label: 'Matryca' },
  { key: 'range', label: 'Zakres' },
  { key: 'loq', label: 'LOQ' },
  { key: 'lod', label: 'LOD' },
  { key: 'tatDays', label: 'Czas realizacji (dni)' },
  { key: 'priceNet', label: 'Koszt netto' },
  { key: 'reportMethodId', label: 'ID w raportach' },
]

/* ===================== Normalizacja danych ===================== */
const toNumOrEmpty = v => (Number.isFinite(+v) ? +v : '')

export const normalizeOnLoad = (arr = []) =>
  (Array.isArray(arr) ? arr : []).map(std => ({
    standardNo: s(std.standardNo),
    title: s(std.title),
    methods: (Array.isArray(std.methods) ? std.methods : []).map(m => ({
      methodNo: s(m.methodNo),
      methodName: s(m.methodName),
      accredited: !!m.accredited,

      // pola workflow:
      sampleType: s(m.sampleType),
      matrix: s(m.matrix),
      rangeMin: s(m.rangeMin),
      rangeMax: s(m.rangeMax),
      rangeUnit: s(m.rangeUnit),
      loq: s(m.loq),
      lod: s(m.lod),
      tatDays: toNumOrEmpty(m.tatDays),
      priceNet: toNumOrEmpty(m.priceNet),
      reportMethodId: s(m.reportMethodId),
    })),
  }))

export const normalizeOnSave = (arr = []) =>
  (Array.isArray(arr) ? arr : []).map(std => ({
    standardNo: s(std.standardNo),
    title: s(std.title),
    methods: (Array.isArray(std.methods) ? std.methods : []).map(m => ({
      methodNo: s(m.methodNo),
      methodName: s(m.methodName),
      accredited: !!m.accredited,

      sampleType: s(m.sampleType),
      matrix: s(m.matrix),
      rangeMin: s(m.rangeMin),
      rangeMax: s(m.rangeMax),
      rangeUnit: s(m.rangeUnit),
      loq: s(m.loq),
      lod: s(m.lod),
      tatDays: toNumOrEmpty(m.tatDays),
      priceNet: toNumOrEmpty(m.priceNet),
      reportMethodId: s(m.reportMethodId),
    })),
  }))

/* ===================== Widok tabeli: flatten ===================== */
export function flattenMethods(standards = []) {
  const rows = []
  for (const std of standards || []) {
    const standardNo = s(std?.standardNo)
    const title = s(std?.title)

    for (const m of std?.methods || []) {
      const range =
        [m.rangeMin, m.rangeMax].filter(Boolean).length
          ? `${s(m.rangeMin)}–${s(m.rangeMax)}${m.rangeUnit ? ` ${s(m.rangeUnit)}` : ''}`.trim()
          : ''

      rows.push({
        standardNo,
        title,

        methodNo: s(m.methodNo),
        methodName: s(m.methodName),

        accredited: !!m.accredited,
        accreditedText: m.accredited ? 'tak' : 'nie',

        // workflow
        sampleType: s(m.sampleType),
        matrix: s(m.matrix),
        range,
        loq: s(m.loq),
        lod: s(m.lod),
        tatDays: m.tatDays ?? '',
        priceNet: m.priceNet ?? '',
        reportMethodId: s(m.reportMethodId),
      })
    }
  }
  return rows
}

/* ===================== Grupowanie po normie ===================== */
export function groupByStandard(flatRows = []) {
  const map = new Map()
  for (const r of flatRows || []) {
    const key = `${r.standardNo}||${r.title}`
    if (!map.has(key)) map.set(key, { standardNo: r.standardNo, title: r.title, rows: [] })
    map.get(key).rows.push(r)
  }
  return Array.from(map.values())
}

/* ===================== Label do DeleteDialog ===================== */
export const labelForDeleteMethod = row =>
  row ? `${row.methodNo || ''} — ${row.methodName || ''} (norma: ${row.standardNo || ''})` : ''

/* ===================== Default form (SSOT) ===================== */
export const EMPTY_METHOD_FORM = {
  standardNo: '',
  title: '',
  methodNo: '',
  methodName: '',
  accredited: false,

  // workflow fields:
  sampleType: '',
  matrix: '',
  rangeMin: '',
  rangeMax: '',
  rangeUnit: '',
  loq: '',
  lod: '',
  tatDays: '',
  priceNet: '',
  reportMethodId: '',
}

/* ===================== Search fields (dla useListQuery) ===================== */
export const getSearchFields = makeSearchFields(
  'standardNo',
  'title',
  'methodNo',
  'methodName',
  'sampleType',
  'matrix',
  'rangeMin',
  'rangeMax',
  'rangeUnit',
  'loq',
  'lod',
  'tatDays',
  'priceNet',
  'reportMethodId',
  r => (r?.accredited ? 'tak' : 'nie')
)
