// src/shared/summaries/utils/sections.js

/**
 * Helpery do budowania configu sekcji (config-only, bez JSX).
 * Zwracają obiekt: { id, Component, props } zgodny z SummaryPage.
 *
 * Uwaga: Component podajesz z zewnątrz (SummaryChartSection itd.),
 * dzięki temu utils nie robi importów cyklicznych.
 */

/**
 * Syntactic sugar: jeśli wolisz “bez id” albo z domyślnym id
 */
export function chart(Component, props = {}) {
  return { id: props.id || 'chart', Component, props }
}

export function table(Component, props = {}) {
  return { id: props.id || 'table', Component, props }
}

export function filters(Component, props = {}) {
  return { id: props.id || 'filters', Component, props }
}

export function kpis(Component, props = {}) {
  return { id: props.id || 'kpis', Component, props }
}
export function chartSection(id, Component, props = {}) {
  return { id, Component, props }
}
export function tableSection(id, Component, props = {}) {
  return { id, Component, props }
}
export function filtersSection(id, Component, props = {}) {
  return { id, Component, props }
}
export function kpiSection(id, Component, props = {}) {
  return { id, Component, props }
}