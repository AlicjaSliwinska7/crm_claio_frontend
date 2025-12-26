// src/components/pages/contents/StatusStepper.jsx
import React from "react";
import { ORDER_STATUSES, NEXT, PREV } from "../pages/workflow";

export default function StatusStepper({ status, onPrev, onNext }) {
  const current = ORDER_STATUSES.indexOf(status);
  return (
    <div className="status-stepper">
      {ORDER_STATUSES.map((s, i) => (
        <div key={s} className={`step ${i <= current ? "is-active" : ""}`}>
          <div className="dot" />
          <div className="label">{s}</div>
        </div>
      ))}
      <div className="stepper-actions">
        <button className="btn" disabled={!PREV[status]} onClick={onPrev} title="Cofnij status" type="button">←</button>
        <button className="btn" disabled={!NEXT[status]} onClick={onNext} title="Dalej" type="button">→</button>
      </div>
    </div>
  );
}
