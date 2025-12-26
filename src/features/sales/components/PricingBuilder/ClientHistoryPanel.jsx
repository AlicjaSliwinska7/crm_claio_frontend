import React from 'react';

export default function ClientHistoryPanel({ clientName, clientHistory }) {
  return (
    <div className="card">
      <div className="card-head">
        <h3 className="card__h3">Historia klienta</h3>
        <div className="small muted">{clientName || '—'}</div>
      </div>

      <div className="hist-kpi">
        <div><span className="small muted">Wykonanych badań</span><b>{clientHistory.totals.tests}</b></div>
        <div><span className="small muted">Łącznie próbek</span><b>{clientHistory.totals.samples}</b></div>
        <div><span className="small muted">Akredytowanych</span><b>{clientHistory.totals.acc}</b></div>
      </div>

      <div className="hist-table">
        <div className="hh">
          <div>Data</div>
          <div>Metoda</div>
          <div className="num">Próbek</div>
          <div>Akred.</div>
        </div>
        <div className="hb">
          {clientHistory.rows.length === 0 ? (
            <div className="small muted">Brak wpisów dla klienta.</div>
          ) : clientHistory.rows.map((r, i) => (
            <div key={i} className="hr">
              <div>{r.date}</div>
              <div className="ellipsis">{r.methodNo} — {r.name}</div>
              <div className="num">{r.samples}</div>
              <div>{r.accredited ? 'TAK' : 'NIE'}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
