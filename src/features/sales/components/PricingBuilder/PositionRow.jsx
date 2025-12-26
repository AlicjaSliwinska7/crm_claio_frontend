import React from 'react';
import { fmtPLN } from './utils';

export default function PositionRow({
  row, methods, pricingSampleTypes,
  onUpdate, onRemove
}) {
  const method = row.method || {};
  const p = method.pricing || {};

  return (
    <div className="table-row">
      <div style={{ display: 'grid', gap: 6 }}>
        <select
          value={row.methodId}
          onChange={(e) => onUpdate({ methodId: e.target.value })}
        >
          {methods.map((mm) => (
            <option key={mm.id} value={mm.id}>
              {mm.methodNo} — {mm.name}
            </option>
          ))}
        </select>

        <div className="row" style={{ gap: 10, alignItems: 'center' }}>
          <label className="checkbox">
            <input
              type="checkbox"
              checked={row.accredited}
              onChange={(e) => onUpdate({ accredited: e.target.checked })}
            />
            Akredytacja
          </label>
          <label className="checkbox">
            <input
              type="checkbox"
              checked={row.urgent}
              onChange={(e) => onUpdate({ urgent: e.target.checked })}
            />
            Pilne
          </label>
          <div className="ctrl" style={{ minWidth: 180 }}>
            <label>Rodzaj przedmiotu</label>
            <select
              value={row.sampleType}
              onChange={(e) => onUpdate({ sampleType: e.target.value })}
            >
              {pricingSampleTypes.map((t) => (
                <option key={t.key} value={t.key}>{t.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="small muted">
          <span>1. próbka: <b>{fmtPLN(p.baseFirst || 0)}</b></span>
          <span className="pill weak">od 2.: {fmtPLN(p.baseNext || 0)}</span>
          <span className="pill weak">min. {p.minChargeSamples || 1} szt.</span>
          {row.accredited && p.accreditedExtraPct > 0 && (
            <span className="pill pill--akr">akred. +{Math.round(p.accreditedExtraPct * 100)}%</span>
          )}
          {row.urgent && p.urgentPct > 0 && (
            <span className="pill">pilne +{Math.round(p.urgentPct * 100)}%</span>
          )}
        </div>
      </div>

      <div>
        <input
          type="number" min={0}
          value={row.samples}
          onChange={(e) => onUpdate({ samples: Math.max(0, Number(e.target.value || 0)) })}
        />
        <div className="small muted">naliczane: {row.chargeSamples} szt.</div>
      </div>

      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <button className="btn danger" onClick={onRemove}>Usuń</button>
      </div>
    </div>
  );
}
