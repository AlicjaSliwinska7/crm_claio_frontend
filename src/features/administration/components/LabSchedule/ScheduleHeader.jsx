import React from 'react';

export default function ScheduleHeader({ monthLabel, onPrev, onNext }) {
  return (
    <div className="schedule-controls">
      <button onClick={onPrev} aria-label="Poprzedni miesiąc">←</button>
      <h2>{monthLabel}</h2>
      <button onClick={onNext} aria-label="Następny miesiąc">→</button>
    </div>
  );
}
