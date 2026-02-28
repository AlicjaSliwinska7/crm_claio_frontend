// src/shared/diagrams/components/SummaryChartBlock.jsx
import React, { useMemo, useState, useEffect } from 'react'
import { getSummaryChartRenderer } from './summaryChartRegistry'

/**
 * Uniwersalny blok sekcji “Summary” oparty o summary.css (es-*)
 * - karta + nagłówek (icon + title)
 * - select trybu (mode) z localStorage
 * - render wykresu wg registry: view.chart
 *
 * section (z configu):
 * {
 *   id:'costs', type:'chartBlock', title:'...', icon:'fa-...',
 *   mode:{ id:'costMode', defaultValue:'time', storageKey:'...', options:[...] },
 *   views:{ time:{ chart:'...', dataKey:'...', props:{} }, labs:{...} }
 * }
 */
export default function SummaryChartBlock({ section, sectionData, ui = {} }) {
  const modeCfg = section?.mode || null
  const views = section?.views || {}

  const viewKeys = useMemo(() => Object.keys(views || {}), [views])
  const computedDefaultMode = useMemo(() => {
    const cfgDefault = modeCfg?.defaultValue
    if (cfgDefault && views?.[cfgDefault]) return cfgDefault
    return viewKeys[0] || 'default'
  }, [modeCfg?.defaultValue, views, viewKeys])

  // --- mode state (z localStorage, ale z walidacją) ---
  const [mode, setMode] = useState(() => {
    const key = modeCfg?.storageKey
    const fallback = computedDefaultMode
    if (!key) return fallback
    try {
      const saved = localStorage.getItem(key)
      return saved || fallback
    } catch {
      return fallback
    }
  })

  // jeśli config się zmieni (np. usunięto tryb), przywróć sensowny mode
  useEffect(() => {
    if (!views || !Object.keys(views).length) return

    const has = !!views?.[mode]
    if (has) return

    const next = computedDefaultMode
    setMode(next)

    const key = modeCfg?.storageKey
    if (key) {
      try {
        localStorage.setItem(key, next)
      } catch {}
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [views, computedDefaultMode])

  // --- wybór view ---
  const view = useMemo(() => {
    if (!views || !Object.keys(views).length) return null
    return views?.[mode] || views?.[computedDefaultMode] || null
  }, [views, mode, computedDefaultMode])

  // --- registry: chart może być stringiem lub obiektem (np. { id:'...', ... } ) ---
  const chartId = useMemo(() => {
    const c = view?.chart
    if (!c) return null
    if (typeof c === 'string') return c
    if (typeof c === 'object') return c.id || c.name || null
    return null
  }, [view])

  const Renderer = useMemo(() => getSummaryChartRenderer(chartId), [chartId])

  // --- dane dla renderera ---
  const data = useMemo(() => {
    const dk = view?.dataKey
    if (!dk) return null
    return sectionData?.[dk] ?? null
  }, [sectionData, view])

  const emptyLabel = view?.emptyLabel || 'Brak danych'

  const isEmpty = useMemo(() => {
    if (!view) return true

    // custom check
    if (typeof view?.isEmptyFn === 'function') {
      try {
        return !!view.isEmptyFn(data, { section, ui })
      } catch {
        return true
      }
    }

    // common shapes
    if (Array.isArray(data)) return data.length === 0

    if (data && typeof data === 'object') {
      if (Array.isArray(data.rows)) return data.rows.length === 0
      if (Array.isArray(data.data)) return data.data.length === 0
      if (Array.isArray(data.items)) return data.items.length === 0
    }

    return !data
  }, [view, data, section, ui])

  const onModeChange = e => {
    const v = e.target.value
    setMode(v)
    const key = modeCfg?.storageKey
    if (key) {
      try {
        localStorage.setItem(key, v)
      } catch {}
    }
  }

  // --- props dla renderera (żeby summary pages nie miały “dodatkowych komponentów”) ---
  const rendererProps = useMemo(() => {
    const base = { data, view, ui }
    const extra = view?.props && typeof view.props === 'object' ? view.props : {}

    // opcjonalne “wstrzyknięcie” kontekstu:
    if (view?.passSection) base.section = section
    if (view?.passSectionData) base.sectionData = sectionData
    if (view?.passUi) base.ui = ui

    return { ...base, ...extra }
  }, [data, view, ui, section, sectionData])

  return (
    <div className='es-card es-section'>
      <div className='es-card__sectionHead'>
        {section?.icon ? <i className={`fa-solid ${section.icon}`} aria-hidden='true' /> : null}
        <h3 className='es-card__sectionTitle'>{section?.title || 'Sekcja'}</h3>
      </div>

      {modeCfg?.options?.length ? (
        <div className='es-panel-head'>
          <div className='es-mode'>
            <span className='es-mode-label'>{modeCfg?.label || 'Tryb:'}</span>
            <select value={mode} onChange={onModeChange} className='es-select sm'>
              {modeCfg.options.map(o => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      ) : null}

      <div className='es-chart'>
        {isEmpty ? (
          <div className='es-empty'>{emptyLabel}</div>
        ) : Renderer ? (
          <Renderer {...rendererProps} />
        ) : (
          <div className='es-empty'>Brak renderer-a wykresu</div>
        )}
      </div>
    </div>
  )
}
