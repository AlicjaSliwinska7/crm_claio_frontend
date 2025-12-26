import React from 'react';

export default function Field({ label, children }) {
  return (
    <div className="field">
      <div className="field-label">{label}</div>
      <div className="field-value">{children ?? '—'}</div>
    </div>
  );
}
