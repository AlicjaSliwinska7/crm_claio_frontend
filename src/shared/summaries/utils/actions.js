// src/shared/summaries/utils/actions.js

/**
 * Helpery do config-only actions (bez JSX)
 */

export function csvAction(key, csv, title) {
  return {
    type: 'csv',
    key,
    title,
    csv,
  }
}

export function buttonAction(key, label, onClick, opts = {}) {
  return {
    type: 'button',
    key,
    label,
    onClick,
    disabled: !!opts.disabled,
    title: opts.title,
  }
}

export function iconAction(key, title, icon, onClick, opts = {}) {
  return {
    type: 'iconButton',
    key,
    title,
    icon,
    onClick,
    disabled: !!opts.disabled,
  }
}

export function customAction(key, render) {
  return {
    type: 'custom',
    key,
    render,
  }
}