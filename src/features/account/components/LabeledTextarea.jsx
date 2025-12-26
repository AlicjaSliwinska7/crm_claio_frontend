import React from 'react';

export default function LabeledTextarea({ label, id, rows = 4, ...props }) {
  const inputId = id || `ta-${(label || '').toLowerCase().replace(/\s+/g, '-')}`;
  return (
    <label className="form-field" htmlFor={inputId}>
      <span className="form-label">{label}</span>
      <textarea id={inputId} rows={rows} {...props} />
    </label>
  );
}
