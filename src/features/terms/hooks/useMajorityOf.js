import { useCallback } from 'react'

export function useMajorityOf() {
  return useCallback((arr, key, order = []) => {
    const cnt = arr.reduce((m, x) => {
      const v = x[key] || 'unknown'
      m[v] = (m[v] || 0) + 1
      return m
    }, {})
    return Object.keys(cnt).sort((a, b) => order.indexOf(a) - order.indexOf(b) || cnt[b] - cnt[a])[0]
  }, [])
}