// src/features/tests/config/testingMethods.config.js
// SSOT — konfiguracja rejestru norm i metod badawczych
// CSV • sortery • normalizery • helpery pod workflow

import { safeString } from '../../../shared/utils/formatters'

/* ─────────────────────────────────
 * CSV — spójne z useCsvExport
 * ───────────────────────────────── */
export const CSV_COLUMNS = [
  { key: 'standardNo',     label: 'nr normy/dokumentu' },
  { key: 'title',          label: 'tytuł' },
  { key: 'methodNo',       label: 'nr metody badawczej' },
  { key: 'accreditedText', label: 'akredytacja' },
  { key: 'methodName',     label: 'nazwa metody badawczej' },
]

/* ─────────────────────────────────
 * Typy dla sortRows (SSOT)
 * ───────────────────────────────── */

export const GROUP_TYPE_MAP = {
  standardNo: { type: 'string' },
  title:      { type: 'string' },
}

export const METHOD_TYPE_MAP = {
  methodNo:       { type: 'string' },
  methodName:     { type: 'string' },
  accreditedText: { type: 'string' },
}

/* ─────────────────────────────────
 * Normalizacja struktury danych
 * (przygotowane pod przyszły workflow)
 * ───────────────────────────────── */

const s = v => safeString(v)

export const normalizeOnLoad = (arr = []) =>
  (Array.isArray(arr) ? arr : []).map(std => ({
    standardNo: s(std.standardNo),
    title:      s(std.title),
    methods: Array.isArray(std.methods)
      ? std.methods.map(m => ({
          methodNo:   s(m.methodNo),
          methodName: s(m.methodName),
          accredited: !!m.accredited,

          // miejsce na szczegóły procesu:
          // sampleType: s(m.sampleType),
          // matrix: s(m.matrix),
          // range: s(m.range),
          // tatDays: Number.isFinite(+m.tatDays) ? +m.tatDays : '',
        }))
      : [],
  }))

export const normalizeOnSave = (arr = []) =>
  (Array.isArray(arr) ? arr : []).map(std => ({
    standardNo: s(std.standardNo),
    title:      s(std.title),
    methods: Array.isArray(std.methods)
      ? std.methods.map(m => ({
          methodNo:   s(m.methodNo),
          methodName: s(m.methodName),
          accredited: !!m.accredited,
        }))
      : [],
  }))

/* ─────────────────────────────────
 * Widok tabeli — flatten + grupowanie
 * ───────────────────────────────── */

export const flattenMethods = (standards = []) => {
  const rows = []
  for (const std of standards || []) {
    for (const m of std.methods || []) {
      rows.push({
        standardNo: std.standardNo,
        title:      std.title,
        methodNo:   m.methodNo,
        methodName: m.methodName,
        accredited: !!m.accredited,
        accreditedText: m.accredited ? 'tak' : 'nie',
      })
    }
  }
  return rows
}

export const groupByStandard = (flatRows = []) => {
  const map = new Map()
  for (const r of flatRows) {
    const key = `${r.standardNo}||${r.title}`
    if (!map.has(key)) {
      map.set(key, {
        standardNo: r.standardNo,
        title:      r.title,
        rows:       [],
      })
    }
    map.get(key).rows.push(r)
  }
  return Array.from(map.values())
}

/* ─────────────────────────────────
 * Etykieta do DeleteDialog
 * ───────────────────────────────── */

export const labelForDeleteMethod = row =>
  row
    ? `${row.methodNo || ''} — ${row.methodName || ''} (norma: ${row.standardNo || ''})`
    : ''
