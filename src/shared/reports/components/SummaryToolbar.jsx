import React from 'react'

/**
 * Uniwersalny toolbar dla stron typu *Summary*.
 * Obsługuje: presety dat, custom range, (opcjonalnie) Group by i akcje (Reset/CSV/XLS/Print).
 *
 * Prop `variant` pozwala utrzymać różne skórki (np. 'smpl' dla Samples, 'ss' dla Sales).
 */
export default function SummaryToolbar({
  variant = 'ss',
  idPrefix = 'sum',
  // date controls
  preset, setPreset,
  from, setFrom,
  to, setTo,
  presetOptions = [
    { value: 'week',    label: 'Ostatnie 7 dni' },
    { value: 'month',   label: 'Ostatnie 30 dni' },
    { value: 'quarter', label: 'Ostatni kwartał' },
    { value: 'year',    label: 'Ostatni rok' },
    { value: 'all',     label: 'Wszystko' },
    { value: 'custom',  label: 'Zakres własny' },
  ],
  // group by
  groupBy, setGroupBy, groupByOptions,
  // actions
  onReset, onExportCsv, onExportXls, onPrint,
  rightExtra,
}) {
  const cls = variant === 'smpl'
    ? {
        bar: 'smpl-toolbar',
        left: 'smpl-toolbar__left',
        right: 'smpl-toolbar__right',
        select: 'smpl-select',
        btn: 'smpl-btn',
        ghost: 'smpl-reset',
      }
    : {
        bar: 'ss-toolbar',
        left: 'ss-toolbar__left',
        right: 'ss-toolbar__right',
        select: 'ss-select',
        btn: 'ss-btn',
        ghost: 'ss-btn ss-btn--ghost',
      }

  return (
    <div className={cls.bar} role="toolbar" aria-label="Narzędzia zestawienia">
      <div className={cls.left} style={{ display: 'flex', gap: 12, alignItems: 'end' }}>
        {typeof preset !== 'undefined' && setPreset && (
          <div className="ts-control" style={{ display: 'grid', gap: 4 }}>
            <label className="muted small" htmlFor={`${idPrefix}-preset`}>Zakres</label>
            <select id={`${idPrefix}-preset`} className={cls.select} value={preset} onChange={e => setPreset(e.target.value)}>
              {presetOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        )}

        {preset === 'custom' && (
          <>
            <div className="ts-control" style={{ display: 'grid', gap: 4 }}>
              <label className="muted small" htmlFor={`${idPrefix}-from`}>Od</label>
              <input id={`${idPrefix}-from`} type="date" value={from || ''} onChange={e => setFrom?.(e.target.value)} />
            </div>
            <div className="ts-control" style={{ display: 'grid', gap: 4 }}>
              <label className="muted small" htmlFor={`${idPrefix}-to`}>Do</label>
              <input id={`${idPrefix}-to`} type="date" value={to || ''} onChange={e => setTo?.(e.target.value)} />
            </div>
          </>
        )}

        {groupByOptions?.length ? (
          <div className="ts-control" style={{ display: 'grid', gap: 4 }}>
            <label className="muted small" htmlFor={`${idPrefix}-groupby`}>Grupuj wg</label>
            <select id={`${idPrefix}-groupby`} className={cls.select} value={groupBy} onChange={e => setGroupBy?.(e.target.value)}>
              {groupByOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        ) : null}
      </div>

      <div className={cls.right} style={{ display: 'flex', gap: 8 }}>
        {onReset && <button className={cls.ghost} onClick={onReset} title="Wyczyść filtry">Wyczyść</button>}
        {onExportCsv && <button className={cls.btn} onClick={onExportCsv} title="Eksport CSV">CSV</button>}
        {onExportXls && <button className={cls.btn} onClick={onExportXls} title="Eksport XLS">XLS</button>}
        {onPrint && <button className={cls.btn} onClick={onPrint} title="Drukuj">Drukuj</button>}
        {rightExtra}
      </div>
    </div>
  )
}
