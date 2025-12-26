import { useMemo } from 'react'

/**
 * Generyczne grupowanie po zadanej konfiguracji.
 * groups = {
 *   byClient: { valueFn: (row) => row.client, label: 'Klienta', displayFn: (k) => k }
 *   ...
 * }
 */
export function useGroupBy(data, groupBy, groups) {
  return useMemo(() => {
    const def = groups[groupBy] || groups[Object.keys(groups)[0]]
    const valueFn = def?.valueFn || (() => '—')
    const grouped = new Map()
    for (const item of data || []) {
      const k = String(valueFn(item) ?? '—')
      if (!grouped.has(k)) grouped.set(k, [])
      grouped.get(k).push(item)
    }
    return {
      def,
      groups,
      grouped,
      entries: Array.from(grouped.entries()),
      displayOf: (k) => (def?.displayFn ? def.displayFn(k) : k),
    }
  }, [data, groupBy, groups])
}
