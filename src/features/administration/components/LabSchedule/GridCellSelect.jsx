import React, { memo } from 'react';

/**
 * Komórka bez inputów – tylko wybór/zaznaczenie.
 * Wartość pokazujemy w <div>, a aktywność i zaznaczenie stylujemy klasami.
 */
function GridCellSelect({
  name,
  dateKey,
  value,
  holiday,
  isSelected,
  isActive,
  onClick,
}) {
  const cellClass = `
    ${holiday ? 'holiday-column' : ''}
    ${value === '1' ? 'shift-1' : ''}
    ${value === '2' ? 'shift-2' : ''}
    ${value === '3' ? 'shift-3' : ''}
    ${value === 'u' ? 'shift-u' : ''}
    ${value === 'l' ? 'shift-l' : ''}
    ${isSelected ? 'selected-cell' : ''}
    ${isActive ? 'active-cell' : ''}
  `;

  return (
    <td
      role="gridcell"
      className={cellClass}
      data-name={name}
      data-date={dateKey}
      onClick={(e) => onClick?.(name, dateKey, e)}
      tabIndex={-1}                 // fokus trzymamy na wrapperze tabeli
      aria-selected={!!isActive}
      title={value || ''}
    >
      <div className="cell-readonly">{value ?? ''}</div>
    </td>
  );
}

export default memo(GridCellSelect);
