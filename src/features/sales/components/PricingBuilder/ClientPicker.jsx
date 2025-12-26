import React from 'react';

export default function ClientPicker({ clients, clientId, onChange, loyaltyBaseTests }) {
  return (
    <div className="row">
      <div className="ctrl" style={{ minWidth: 260 }}>
        <label>Klient</label>
        <select value={clientId} onChange={(e) => onChange(e.target.value)}>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <span className="small muted">
          Łącznie badań w historii: <b>{loyaltyBaseTests}</b>
        </span>
      </div>
    </div>
  );
}
