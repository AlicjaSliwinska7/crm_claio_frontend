// src/shared/summaries/utils/csv.js

/**
 * Helper do csv config
 */

export function csvConfig(rows, opts = {}) {
  return {
    rows: rows || [],
    columns: opts.columns,
    filename: opts.filename,
    title: opts.title,
  }
}