// Stałe / formatery / wspólne ustawienia osi i legendy

export const DAY = 24 * 60 * 60 * 1000

export const PLN_FMT = new Intl.NumberFormat('pl-PL', {
  style: 'currency',
  currency: 'PLN',
  maximumFractionDigits: 0,
})
export const INT_FMT = new Intl.NumberFormat('pl-PL')

export const fmtPLN = n => PLN_FMT.format(Number(n || 0))
export const fmtInt = n => INT_FMT.format(Number(n || 0))

// Odstępy tytułów osi (spójne)
export const AXIS = { xDy: 28, yLeftDy: 56, yRightDy: 56 }

// Wycentrowana legenda pod wykresami
export const centeredLegend = { left: 0, right: 0, width: '100%', margin: '0 auto', textAlign: 'center' }

// Paleta kolorów do laboratoriów
export const palette = [
  '#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd',
  '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf',
]
