import React from 'react'
import { fmtPLN } from './utils'

export default function PriceMethodCard({ method, onAdd }) {
  const p = method?.pricing || {}
  const accr = (p.accreditedExtraPct || 0) * 100
  const urgent = (p.urgentPct || 0) * 100
  const minS = p.minChargeSamples || 1

  return (
    <article className="method-card">
      <header className="method-card__head">
        <div className="method-card__title">
          <b>{method.methodNo}</b>
          <span className="muted">— {method.name}</span>
        </div>
        {method.accredited && <span className="pill pill--akr">akred.</span>}
      </header>

      <dl className="method-spec">
        <div>
          <dt>1. próbka</dt><dd className="num">{fmtPLN(p.baseFirst || 0)}</dd>
        </div>
        <div>
          <dt>od 2. do N</dt><dd className="num">{fmtPLN(p.baseNext || 0)}</dd>
        </div>
        <div>
          <dt>min. naliczanie</dt><dd className="num">{minS} szt.</dd>
        </div>
      </dl>

      <div className="method-flags">
        {method.subject && <span className="pill weak">{method.subject}</span>}
        {accr > 0 && method.accredited && <span className="pill pill--akr">akred. +{accr}%</span>}
        {urgent > 0 && <span className="pill">pilne +{urgent}%</span>}
      </div>

      <footer className="method-card__actions">
        <button className="btn" onClick={onAdd} title="Dodaj tę metodę do wyceny">
          Dodaj do wyceny
        </button>
      </footer>
    </article>
  )
}
