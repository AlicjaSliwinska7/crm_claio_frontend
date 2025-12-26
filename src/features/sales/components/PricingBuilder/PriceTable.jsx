import React from 'react';
import { fmtPLN } from './utils';

export default function PriceTable({ methods }) {
  return (
    <div className="card">
      <div className="card-head">
        <h3 className="card__h3">Cennik jawny</h3>
        <div className="small muted">bazowo z „methods”</div>
      </div>

      <div className="price-table">
        <div className="ph">
          <div>Metoda</div>
          <div>Nazwa</div>
          <div className="num">1. próbka</div>
          <div className="num">od 2. do N</div>
          <div>Uwagi</div>
        </div>

        {methods.map((m) => {
          const p = m.pricing || {};
          const accr = (p.accreditedExtraPct || 0) * 100;
          return (
            <div key={m.id} className="pr">
              <div className="ellipsis">{m.methodNo}</div>
              <div className="ellipsis">{m.name}</div>
              <div className="num">{fmtPLN(p.baseFirst || 0)}</div>
              <div className="num">{fmtPLN(p.baseNext || 0)}</div>
              <div className="small muted">
                min. {p.minChargeSamples || 1} szt.
                {m.accredited && accr > 0 && <span className="pill pill--akr">akred. +{accr}%</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
