// src/components/pages/contents/workflow.js

/** ===== Statusy zlecenia (dok. / sprzedaż) ===== */
export const ORDER_STATUSES = [
  "w przygotowaniu",
  "wysłane",
  "podpisane",
  "zarejestrowane",
];

// dozwolone przejścia (przód / tył)
export const NEXT = {
  "w przygotowaniu": "wysłane",
  "wysłane": "podpisane",
  "podpisane": "zarejestrowane",
  "zarejestrowane": null,
};

export const PREV = {
  "w przygotowaniu": null,
  "wysłane": "w przygotowaniu",
  "podpisane": "wysłane",
  "zarejestrowane": "podpisane",
};

/** ===== Etapy procesu głównego (zdeduplikowane, w logicznej kolejności) =====
 * Uwaga: w źródłowej liście były powtórzenia; na potrzeby selektorów/logiki
 * trzymamy unikalne etapy.
 */
export const MAIN_PROCESS_STAGES = [
  "Oczekiwanie na dostawę próbek do badań",
  "Protokół Przyjęcia Próbki do przygotowania",
  "Program Badań do przygotowania",
  "Karty Badań do przygotowania",
  "W trakcie badań",
  "Dokumentacja do weryfikacji",
  "Raporty do przygotowania",
  "Pełna dokumentacja",
];

/** Mapowanie status → domyślny etap procesu głównego (wejście do procesu) */
const STATUS_TO_MAIN_STAGE = {
  zarejestrowane: MAIN_PROCESS_STAGES[0], // start procesu po rejestracji
};

/** Zwraca etap procesu głównego wynikający ze statusu (gdy nie dotyczy — "—"). */
export const MAIN_PROCESS_STAGE = (orderStatus) =>
  STATUS_TO_MAIN_STAGE[orderStatus] || "—";

/** ===== Pomocnicze utilsy do statusów (opcjonalne) ===== */
export const canGoNext = (status) => Boolean(NEXT[status]);
export const canGoPrev = (status) => Boolean(PREV[status]);
export const advanceStatus = (status) => NEXT[status] ?? status;
export const revertStatus = (status) => PREV[status] ?? status;
