// src/shared/summaries/utils/blocks.js

/**
 * Helpery do definicji chart/table blocks
 */

export function chartBlock(Component, props = {}, opts = {}) {
  return {
    Component,
    props,
    className: opts.className, // np. 'big', 'mini', 'd2-chart--h440'
  }
}

export function tableBlock(Component, props = {}) {
  return {
    Component,
    props,
  }
}