export const fmtDate  = d => (d ? new Date(d).toLocaleDateString('pl-PL') : '—')
export const monthKey = s => (s ? String(s).slice(0,7) : '')

export function withinRange(val, min, max) {
  if (val == null || isNaN(val)) return false
  if (min !== '' && !isNaN(min) && Number(val) < Number(min)) return false
  if (max !== '' && !isNaN(max) && Number(val) > Number(max)) return false
  return true
}

export function groupBy(arr, keyFn) {
  const m = new Map()
  for (const x of arr) {
    const k = keyFn(x)
    const list = m.get(k); list ? list.push(x) : m.set(k, [x])
  }
  return m
}

export const sum = (arr, sel) => arr.reduce((a,x)=>a + (Number(sel(x))||0), 0)
export const avg = (arr, sel) => (arr.length ? sum(arr, sel) / arr.length : 0)
