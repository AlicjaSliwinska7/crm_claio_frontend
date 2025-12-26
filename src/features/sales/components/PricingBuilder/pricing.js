// Konfiguracja globalna (możesz rozszerzać o własne pola)
export const PRICING_CFG = {
  vatPct: 0.23,
  loyalty: [
    { minTotalTests: 10, pct: 0.03 },
    { minTotalTests: 25, pct: 0.05 },
    { minTotalTests: 50, pct: 0.08 },
  ],
  sampleTypes: [
    { key: 'standard', label: 'Standard' },
    { key: 'wielkogabarytowy', label: 'Wielkogabarytowy' },
    { key: 'niebezpieczny', label: 'Niebezpieczny' },
  ],
};

/**
 * Dopasowanie progu lojalnościowego.
 * Zwraca: { match, next }
 */
export function matchLoyaltyTier(totalTests, tiers) {
  const sorted = [...tiers].sort((a, b) => a.minTotalTests - b.minTotalTests);
  let match = { minTotalTests: 0, pct: 0 };
  for (const t of sorted) if (totalTests >= t.minTotalTests) match = t;
  const next = sorted.find((t) => t.minTotalTests > totalTests) || null;
  return { match, next };
}

// Alias zgodny z poprzednim kodem (opcjonalny)
export const loyaltyTierFor = matchLoyaltyTier;

/**
 * Liczenie ceny linii netto:
 * - minimalna liczba naliczanych próbek,
 * - baza: pierwsza + od 2. do N,
 * - dopłaty procentowe: rodzaj próbki, akredytacja, pilne.
 */
export function calcLineNet(method, { samples, accredited, urgent, sampleType }) {
  const cfg = method?.pricing || {};
  const n = Math.max(0, Number(samples || 0));
  const minS = Math.max(1, Number(cfg.minChargeSamples || 1));
  const chargeSamples = Math.max(n, minS);

  // baza: pierwsza + reszta (od 2. do N)
  let base = 0;
  if (chargeSamples >= 1) base += Number(cfg.baseFirst || 0);
  if (chargeSamples >= 2) base += (chargeSamples - 1) * Number(cfg.baseNext || 0);

  // dopłaty procentowe
  const typePct = (cfg.sampleTypeExtras || {})[sampleType || 'standard'] || 0;
  const accrPct = accredited ? Number(cfg.accreditedExtraPct || 0) : 0;
  const urgentPct = urgent ? Number(cfg.urgentPct || 0) : 0;

  const net = base * (1 + typePct + accrPct + urgentPct);
  return {
    base,
    chargeSamples,
    net,
    parts: { typePct, accrPct, urgentPct },
  };
}
