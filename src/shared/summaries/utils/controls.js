// src/shared/summaries/utils/controls.js

/**
 * Helpery do config-only controls (bez JSX)
 */

export function selectControl(key, label, value, onChange, options, opts = {}) {
  return {
    type: 'select',
    key,
    label,
    value,
    onChange,
    options: options || [],
    placeholder: opts.placeholder,
    width: opts.width,
  }
}

export function multiSelectControl(key, label, value, onChange, options, opts = {}) {
  return {
    type: 'multiselect',
    key,
    label,
    value: Array.isArray(value) ? value : [],
    onChange,
    options: options || [],
    placeholder: opts.placeholder,
    width: opts.width,
  }
}

export function textControl(key, label, value, onChange, opts = {}) {
  return {
    type: 'text',
    key,
    label,
    value: value ?? '',
    onChange,
    placeholder: opts.placeholder,
    width: opts.width,
  }
}

export function searchControl(key, label, value, onChange, opts = {}) {
  return {
    type: 'search',
    key,
    label,
    value: value ?? '',
    onChange,
    placeholder: opts.placeholder,
    icon: opts.icon, // opcjonalnie
    width: opts.width,
    limitClassName: opts.limitClassName, // np. "tss-search__box--limit"
  }
}

export function dateControl(key, label, value, onChange, opts = {}) {
  return {
    type: 'date',
    key,
    label,
    value: value ?? '',
    onChange,
    width: opts.width,
  }
}

export function dateRangeControl(key, from, setFrom, to, setTo, opts = {}) {
  return {
    type: 'daterange',
    key,
    from,
    setFrom,
    to,
    setTo,
    fromLabel: opts.fromLabel,
    toLabel: opts.toLabel,
    width: opts.width,
  }
}

export function toggleControl(key, label, checked, onChange) {
  return {
    type: 'toggle',
    key,
    label,
    checked: !!checked,
    onChange,
  }
}

export function customControl(key, render) {
  return {
    type: 'custom',
    key,
    render,
  }
}

export function buttonControl(key, label, onClick, opts = {}) {
  return {
    type: 'button',
    key,
    label,
    onClick,
    kind: opts.kind, // 'default' | 'icon'
    icon: opts.icon,
    title: opts.title,
    disabled: !!opts.disabled,
  }
}