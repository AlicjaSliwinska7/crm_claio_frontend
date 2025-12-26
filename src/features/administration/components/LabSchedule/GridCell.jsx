import React, { memo } from 'react';

/**
 * Komórka grafiku (zachowane dotychczasowe klasy/stylowanie).
 * - W readOnly fokus wpada w <td>, w edycji w <input>.
 * - data-name i data-date ułatwiają fokus przez shared keyboardNav.
 */
function GridCell({
  readOnly,
  name,
  dateKey,
  value,
  holiday,
  isSelected,
  isActive,
  onClick,
  onChange,
  onKeyDown,
  onPaste,
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

  const stopCaretAndDelegate = (e) => {
    // przejmij strzałki/Tab/Enter – niech nie ruszają caret’u w <input>
    const k = e.key;
    if (
      k === 'ArrowUp' ||
      k === 'ArrowDown' ||
      k === 'ArrowLeft' ||
      k === 'ArrowRight' ||
      k === 'Tab' ||
      k === 'Enter'
    ) {
      e.preventDefault();
    }
    // przekaż kontekst komórki do wspólnego handlera
    onKeyDown?.(e, name, dateKey);
  };

  const handlePaste = (e) => {
    // przekaż dalej (grid może rozpoznać TSV i rozlać po macierzy)
    onPaste?.(e, name, dateKey);
  };

  return (
    <td
      className={cellClass}
      onClick={(e) => onClick?.(name, dateKey, e)}
      tabIndex={readOnly ? 0 : -1}             // fokus TD tylko w readOnly
      data-active={isActive || undefined}
      data-name={name}
      data-date={dateKey}
      onKeyDown={readOnly ? stopCaretAndDelegate : undefined}
      role="gridcell"
      aria-selected={!!isActive}
      title={value || ''}
    >
      {readOnly ? (
        <div className="cell-readonly">{value ?? ''}</div>
      ) : (
        <input
          type="text"
          className="cell-input"
          value={value ?? ''}
          maxLength={1}                          // 1 znak (1/2/3/u/l)
          inputMode="text"
          autoCapitalize="off"
          autoCorrect="off"
          autoComplete="off"
          spellCheck={false}
          tabIndex={0}
          data-name={name}
          data-date={dateKey}
          onChange={(e) => onChange?.(name, dateKey, e.target.value)}
          onKeyDown={stopCaretAndDelegate}       // ← kluczowe: przechwyt strzałek/tab/enter
          onPaste={handlePaste}
        />
      )}
    </td>
  );
}

export default memo(GridCell);
