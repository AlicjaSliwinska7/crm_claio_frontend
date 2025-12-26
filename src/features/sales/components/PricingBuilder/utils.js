// Wspólne utilsy dla PricingBuilder
export const fmtPLN = (n) =>
  new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency: 'PLN',
    maximumFractionDigits: 0,
  }).format(Number(n || 0));

export const sum = (arr) => arr.reduce((a, b) => a + (Number(b) || 0), 0);
