import React from 'react';
import { fmtPLN } from './utils';

export default function SummaryPanel({
  totals, defaultVat, loyaltyTier, loyaltyBaseTests,
  overrideOn, overrideNet, setOverrideOn, setOverrideNet,
  onExportCsv, onSaveOffer
}) {
  return (
    <div className="card sticky">
      <div className="card-head">
        <h3 className="card__h3">Podsumowanie</h3>
        <div className="small muted">VAT {Math.round(defaultVat * 100)}%</div>
      </div>

      <ul className="lines">
        {totals.lines.map((li) => (
          <li key={li.id}>
            <div className="line__title">
              <div><b>{li.method?.methodNo || li.methodId}</b> — {li.method?.name || ''}</div>
              {li.accredited && <span className="pill pill--akr">akred.</span>}
              {li.urgent && <span className="pill">pilne</span>}
              {li.sampleType !== 'standard' && <span className="pill weak">{li.sampleType}</span>}
              <div className="line__meta">
                <span className="small muted">
                  1. próbk.: {fmtPLN(li.base - (li.chargeSamples > 1 ? (li.chargeSamples - 1) * (li.method?.pricing?.baseNext || 0) : 0))}
                </span>
                <span className="small muted" style={{ marginLeft: 8 }}>
                  od 2.: {li.chargeSamples > 1 ? `${li.chargeSamples - 1} × ${fmtPLN(li.method?.pricing?.baseNext || 0)}` : '—'}
                </span>
              </div>
            </div>
            <div className="line__total">{fmtPLN(li.net)}</div>
          </li>
        ))}
      </ul>

      <div className="sum">
        <div className="sum__row">
          <span>Suma netto (przed rabatami)</span>
          <b>{fmtPLN(totals.subNet)}</b>
        </div>

        {totals.loyalPct > 0 ? (
          <div className="sum__row muted loyalty-row" title={`Próg od ${loyaltyTier.minTotalTests} badań`}>
            <span>Rabat lojalnościowy
              <span className="badge">próg {loyaltyTier.minTotalTests}+</span>
              <span className="hint">({loyaltyBaseTests} badań łącznie)</span>
            </span>
            <b>-{Math.round(totals.loyalPct * 100)}% ({fmtPLN(totals.loyalVal)})</b>
          </div>
        ) : (
          <div className="sum__row muted loyalty-row">
            <span>Rabat lojalnościowy</span>
            <b>0%</b>
          </div>
        )}

        <div className="sum__row total">
          <span>Po rabatach</span>
          <b>{fmtPLN(overrideOn ? Number(overrideNet || 0) : totals.afterLoyal)}</b>
        </div>

        <div className="sum__row">
          <span>VAT {Math.round(defaultVat * 100)}%</span>
          <b>{fmtPLN(totals.vatVal)}</b>
        </div>

        <div className="sum__row grand">
          <span>Brutto</span>
          <b>{fmtPLN(totals.grand)}</b>
        </div>

        <div className="row" style={{ alignItems: 'center' }}>
          <label className="checkbox">
            <input type="checkbox" checked={overrideOn} onChange={(e) => setOverrideOn(e.target.checked)} />
            Ręcznie nadpisz cenę netto (po rabatach)
          </label>
          {overrideOn && (
            <input
              className="override-input"
              type="number" min={0}
              value={overrideNet}
              onChange={(e) => setOverrideNet(e.target.value)}
              placeholder="np. 3500"
              title="Kwota netto po rabatach"
            />
          )}
        </div>

        <div className="actions">
          <button className="btn btn--export" onClick={onExportCsv}>Eksportuj CSV</button>
          <button className="btn primary" onClick={onSaveOffer}>Zapisz ofertę</button>
        </div>
      </div>
    </div>
  );
}
