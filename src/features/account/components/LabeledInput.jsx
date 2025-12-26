import React from 'react';

export default function LabeledInput({ label, id, ...props }) {
  const inputId = id || `fi-${(label || '').toLowerCase().replace(/\s+/g, '-')}`;
  return (
    <label className="form-field" htmlFor={inputId}>
      <span className="form-label">{label}</span>
      <input id={inputId} {...props} />
    </label>
  );
}
