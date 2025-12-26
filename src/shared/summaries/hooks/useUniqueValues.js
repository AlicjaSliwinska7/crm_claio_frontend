import { useMemo } from 'react'

export default function useUniqueValues(list = [], valueFn = x => x, { locale = 'pl', sort = true } = {}) {
  return useMemo(() => {
    const set = new Set()
    for (const item of list) {
      const v = valueFn(item)
      if (v != null && v !== '') set.add(v)
    }
    const arr = Array.from(set)
    return sort ? arr.sort((a, b) => String(a).localeCompare(String(b), locale)) : arr
  }, [list, valueFn, locale, sort])
}
