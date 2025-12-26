// src/features/administration/components/LabSchedule/Legend.jsx
import React, { useMemo } from 'react';
import LegendList from './LegendList';

/**
 * Jeden komponent dla obu przypadków:
 * - bez selectedEmployee => klasyczna "Legenda:"
 * - z selectedEmployee   => "Suma:" + kolumna z wartościami
 */
export default function Legend({ selectedEmployee, getSummaryForEmployee }) {
  const counts = useMemo(() => {
    if (!selectedEmployee) return null;
    return getSummaryForEmployee?.(selectedEmployee);
  }, [selectedEmployee, getSummaryForEmployee]);

  return (
    <LegendList
      title={selectedEmployee ? 'Suma:' : 'Legenda:'}
      counts={selectedEmployee ? counts : undefined}
    />
  );
}
