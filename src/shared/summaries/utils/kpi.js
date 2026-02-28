// src/shared/summaries/utils/kpi.js

/**
 * Helpery do KPI (config-only)
 */

export function kpiItem(key, label, value, opts = {}) {
  return {
    key,
    label,
    value,
    icon: opts.icon,
    sub: opts.sub,
  }
}

export function kpiSectionProps(title, items, opts = {}) {
  return {
    title,
    icon: opts.icon,
    subtitle: opts.subtitle,
    items,
  }
}