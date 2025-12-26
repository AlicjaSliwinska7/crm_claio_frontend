// src/features/administration/components/LabSchedule/SummaryPanel.jsx
import React, { useMemo } from 'react';
import LegendList from './LegendList';

export default function SummaryPanel({ selectedEmployee, getSummaryForEmployee }) {
  const counts = useMemo(() => {
    if (!selectedEmployee) return null;
    return getSummaryForEmployee(selectedEmployee);
  }, [selectedEmployee, getSummaryForEmployee]);

  if (!selectedEmployee || !counts) return null;

  return <LegendList title="Suma:" counts={counts} />;
}
