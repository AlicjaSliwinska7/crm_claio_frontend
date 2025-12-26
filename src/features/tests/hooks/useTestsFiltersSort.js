import { useEffect, useState, useCallback } from 'react';

const readParam = (sp, key, fallback = '') => sp.get(key) ?? fallback;
const setOrDelete = (sp, key, val) => {
  if (val === '' || val === 'wszystkie' || val == null) sp.delete(key);
  else sp.set(key, val);
};

/**
 * Stan filtrów + sort w URL (q, status, outcome, start, end, sort)
 */
export default function useTestsFiltersSort(searchParams, setSearchParams) {
  // init z URL
  const [filter, setFilter] = useState(() => readParam(searchParams, 'q', ''));
  const [filterStatus, setFilterStatus] = useState(() => readParam(searchParams, 'status', 'wszystkie'));
  const [filterOutcome, setFilterOutcome] = useState(() => readParam(searchParams, 'outcome', 'wszystkie'));
  const [startOn, setStartOn] = useState(() => readParam(searchParams, 'start', ''));
  const [endOn, setEndOn] = useState(() => readParam(searchParams, 'end', ''));
  const [sortConfig, setSortConfig] = useState(() => {
    const sortStr = readParam(searchParams, 'sort', 'startDate:desc');
    const [key, direction] = sortStr.split(':');
    return { key: key || 'startDate', direction: direction === 'asc' ? 'asc' : 'desc' };
  });

  // sync → URL
  useEffect(() => {
    const next = new URLSearchParams(searchParams);
    setOrDelete(next, 'q', filter);
    setOrDelete(next, 'status', filterStatus);
    setOrDelete(next, 'outcome', filterOutcome);
    setOrDelete(next, 'start', startOn);
    setOrDelete(next, 'end', endOn);
    const sortStr = sortConfig?.key ? `${sortConfig.key}:${sortConfig.direction}` : '';
    setOrDelete(next, 'sort', sortStr);
    next.delete('page'); // przy zmianie filtrów/sortu — wracamy na 1
    setSearchParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, filterStatus, filterOutcome, startOn, endOn, sortConfig]);

  const resetAll = useCallback(() => {
    setFilter('');
    setFilterStatus('wszystkie');
    setFilterOutcome('wszystkie');
    setStartOn('');
    setEndOn('');
  }, []);

  return {
    filter, setFilter,
    filterStatus, setFilterStatus,
    filterOutcome, setFilterOutcome,
    startOn, setStartOn,
    endOn, setEndOn,
    sortConfig, setSortConfig,
    resetAll,
  };
}
