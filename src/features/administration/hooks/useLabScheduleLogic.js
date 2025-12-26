import { useEffect, useMemo, useRef, useState } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  addMonths,
  subMonths,
  isWeekend,
  isSameDay,
  parseISO,
} from 'date-fns';

const STATIC_PL_HOLIDAYS = [
  '2025-01-01','2025-01-06','2025-04-20','2025-04-21','2025-05-01','2025-05-03',
  '2025-06-08','2025-06-19','2025-08-15','2025-11-01','2025-11-11','2025-12-25','2025-12-26',
].map((d) => parseISO(d));

const EMPLOYEES = [
  'Anna Nowak','Piotr Kowalski','Maria Zielińska','Tomasz Wójcik','Ewa Dąbrowska',
  'Paweł Lewandowski','Karolina Mazur','Jan Kaczmarek','Aleksandra Szymańska',
];

export default function useLabScheduleLogic() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [schedule, setSchedule] = useState({});
  const [customHolidays, setCustomHolidays] = useState([]);
  const [showFullScreen, setShowFullScreen] = useState(false);
  const [selectedRange, setSelectedRange] = useState(null);
  const [activeCell, setActiveCell] = useState({ name: null, dateKey: null });
  const [selectedSummaryEmployee, setSelectedSummaryEmployee] = useState(null);

  const inputRefs = useRef({}); // zachowane – na wypadek dalszej rozbudowy

  const daysInMonth = useMemo(() => eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate),
  }), [currentDate]);

  const isHoliday = (day) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    return isWeekend(day) ||
      STATIC_PL_HOLIDAYS.some((d) => isSameDay(d, day)) ||
      customHolidays.includes(dateStr);
  };

  const toggleCustomHoliday = (dateStr) => {
    setCustomHolidays((prev) =>
      prev.includes(dateStr) ? prev.filter((d) => d !== dateStr) : [...prev, dateStr]
    );
  };

  const handleChange = (name, date, value) => {
    const v = value.toLowerCase();
    if (!['', '1', '2', '3', 'u', 'l'].includes(v)) return;
    setSchedule((prev) => ({
      ...prev,
      [name]: {
        ...prev[name],
        [date]: v,
      },
    }));
  };

  const handleKeyNavigation = (e, currentName, currentDateKey) => {
    const rowIndex = EMPLOYEES.indexOf(currentName);
    const colIndex = daysInMonth.findIndex((day) => format(day, 'yyyy-MM-dd') === currentDateKey);
    let newRow = rowIndex, newCol = colIndex;

    switch (e.key) {
      case 'ArrowRight': newCol++; break;
      case 'ArrowLeft':  newCol--; break;
      case 'ArrowDown':  newRow++; break;
      case 'ArrowUp':    newRow--; break;
      default: return;
    }

    if (newRow >= 0 && newRow < EMPLOYEES.length && newCol >= 0 && newCol < daysInMonth.length) {
      const updatedName = EMPLOYEES[newRow];
      const updatedDateKey = format(daysInMonth[newCol], 'yyyy-MM-dd');
      // jeśli referencje będą użyte — tutaj można je wywołać
      inputRefs.current[updatedName]?.[updatedDateKey]?.focus?.();
      setActiveCell({ name: updatedName, dateKey: updatedDateKey });
      setSelectedRange({
        startName: updatedName, endName: updatedName,
        startDateKey: updatedDateKey, endDateKey: updatedDateKey,
      });
      e.preventDefault();
    }
  };

  const handleCellClick = (name, dateKey, e) => {
    if (e.shiftKey && selectedRange) {
      const startRow = EMPLOYEES.indexOf(selectedRange.startName);
      const endRow = EMPLOYEES.indexOf(name);
      const startCol = daysInMonth.findIndex((d) => format(d, 'yyyy-MM-dd') === selectedRange.startDateKey);
      const endCol = daysInMonth.findIndex((d) => format(d, 'yyyy-MM-dd') === dateKey);
      setSelectedRange({
        startName: EMPLOYEES[Math.min(startRow, endRow)],
        endName: EMPLOYEES[Math.max(startRow, endRow)],
        startDateKey: format(daysInMonth[Math.min(startCol, endCol)], 'yyyy-MM-dd'),
        endDateKey: format(daysInMonth[Math.max(startCol, endCol)], 'yyyy-MM-dd'),
      });
    } else {
      setSelectedRange({ startName: name, endName: name, startDateKey: dateKey, endDateKey: dateKey });
      setActiveCell({ name, dateKey });
      setSelectedSummaryEmployee(name);
    }
  };

  const getSummaryForEmployee = (name) => {
    const values = Object.entries(schedule[name] || {});
    const summary = { 1: 0, 2: 0, 3: 0, u: 0, l: 0 };
    values.forEach(([date, shift]) => {
      if (daysInMonth.some((day) => format(day, 'yyyy-MM-dd') === date) && ['1','2','3','u','l'].includes(shift)) {
        summary[shift]++;
      }
    });
    return summary;
  };

  const isInSelectionRange = (name, dateKey) => {
    if (!selectedRange) return false;
    const rowIndex = EMPLOYEES.indexOf(name);
    const colIndex = daysInMonth.findIndex((d) => format(d, 'yyyy-MM-dd') === dateKey);

    const startRow = EMPLOYEES.indexOf(selectedRange.startName);
    const endRow = EMPLOYEES.indexOf(selectedRange.endName);
    const startCol = daysInMonth.findIndex((d) => format(d, 'yyyy-MM-dd') === selectedRange.startDateKey);
    const endCol = daysInMonth.findIndex((d) => format(d, 'yyyy-MM-dd') === selectedRange.endDateKey);

    return (
      rowIndex >= Math.min(startRow, endRow) && rowIndex <= Math.max(startRow, endRow) &&
      colIndex >= Math.min(startCol, endCol) && colIndex <= Math.max(startCol, endCol)
    );
  };

  // Kopiuj (Ctrl+C) wybrany zakres
  useEffect(() => {
    const handleCopy = (e) => {
      if (!(e.ctrlKey && e.key === 'c' && selectedRange)) return;
      e.preventDefault();
      const sRow = EMPLOYEES.indexOf(selectedRange.startName);
      const eRow = EMPLOYEES.indexOf(selectedRange.endName);
      const sCol = daysInMonth.findIndex((d) => format(d, 'yyyy-MM-dd') === selectedRange.startDateKey);
      const eCol = daysInMonth.findIndex((d) => format(d, 'yyyy-MM-dd') === selectedRange.endDateKey);

      let copiedText = '';
      for (let i = sRow; i <= eRow; i++) {
        const row = [];
        for (let j = sCol; j <= eCol; j++) {
          const employee = EMPLOYEES[i];
          const dateKey = format(daysInMonth[j], 'yyyy-MM-dd');
          row.push(schedule[employee]?.[dateKey] || '');
        }
        copiedText += row.join('\t') + '\n';
      }
      navigator.clipboard.writeText(copiedText.trim());
    };

    window.addEventListener('keydown', handleCopy);
    return () => window.removeEventListener('keydown', handleCopy);
  }, [selectedRange, schedule, daysInMonth]);

  // Wklej do tabeli (startName, startDateKey)
  const handlePaste = (e, startName, startDateKey) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain').trim();
    const rows = text.split('\n').map((row) => row.split('\t'));
    const sRow = EMPLOYEES.indexOf(startName);
    const sCol = daysInMonth.findIndex((d) => format(d, 'yyyy-MM-dd') === startDateKey);
    const newSchedule = { ...schedule };

    for (let i = 0; i < rows.length; i++) {
      for (let j = 0; j < rows[i].length; j++) {
        const employee = EMPLOYEES[sRow + i];
        const date = daysInMonth[sCol + j];
        if (employee && date) {
          const val = rows[i][j].trim().toLowerCase();
          if (['', '1', '2', '3', 'u', 'l'].includes(val)) {
            if (!newSchedule[employee]) newSchedule[employee] = {};
            newSchedule[employee][format(date, 'yyyy-MM-dd')] = val;
          }
        }
      }
    }
    setSchedule(newSchedule);
  };

  const goPrevMonth = () => setCurrentDate((prev) => subMonths(prev, 1));
  const goNextMonth = () => setCurrentDate((prev) => addMonths(prev, 1));

  return {
    state: {
      currentDate, schedule, customHolidays, showFullScreen, selectedRange, activeCell, selectedSummaryEmployee,
    },
    daysInMonth,
    employees: EMPLOYEES,
    isHoliday,
    setShowFullScreen,
    goPrevMonth,
    goNextMonth,
    toggleCustomHoliday,
    handleChange,
    handleKeyNavigation,
    handleCellClick,
    handlePaste,
    getSummaryForEmployee,
    isInSelectionRange,
  };
}
