import React from 'react';
import PositionRow from './PositionRow';

export default function PositionsTable({
  lines, methods, pricingSampleTypes, onAdd, onUpdateLine, onRemoveLine
}) {
  return (
    <div className="card">
      <div className="card-head">
        <h3 className="card__h3">Wycena</h3>
        <div className="small muted">sprzedaż / cennik</div>
      </div>

      <div className="table-head">
        <div>Pozycja (metoda)</div>
        <div className="num">Próbek</div>
        <div></div>
      </div>

      {lines.map((li) => (
        <PositionRow
          key={li.id}
          row={li}
          methods={methods}
          pricingSampleTypes={pricingSampleTypes}
          onUpdate={(patch) => onUpdateLine(li.id, patch)}
          onRemove={() => onRemoveLine(li.id)}
        />
      ))}

      <div className="table-actions">
        <button className="btn" onClick={onAdd}>Dodaj pozycję</button>
      </div>
    </div>
  );
}
