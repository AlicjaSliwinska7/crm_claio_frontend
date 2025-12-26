// Zwracamy zunifikowane rekordy:
// { id, type, title, subtitle, date, url, score, status }
const MOCK = [
  { id: "c-1", type: "client",    title: "ACME Sp. z o.o.",  subtitle: "Klient • Kraków",  date: "2025-06-01", url: "/sprzedaz/klienci/ACME", score: 0.92 },
  { id: "o-42", type: "offer",    title: "Oferta #42",       subtitle: "ACME • HPLC",      date: "2025-07-12", url: "/sprzedaz/oferty/42",   score: 0.88, status: "wysłana" },
  { id: "s-7",  type: "sample",   title: "Próbka #S-7",      subtitle: "PP/2025/0007",     date: "2025-07-20", url: "/probki/rejestr/7",     score: 0.75, status: "w trakcie badań" },
  { id: "d-3",  type: "document", title: "Instrukcja PPP v2",subtitle: "Dokument",         date: "2025-04-10", url: "/dokumenty/3",          score: 0.61 },
  { id: "eq-5", type: "equipment",title: "Wagosuszarka W-5", subtitle: "Urządzenie",        date: "2024-12-02", url: "/wyposazenie/5",        score: 0.55, status: "w kalibracji" },
];

export async function searchAll({ q }) {
  const text = (q || "").trim().toLowerCase();
  if (!text) return MOCK;
  const words = text.split(/\s+/).filter(Boolean);
  const hit = (t = "") => {
    const s = t.toLowerCase();
    return words.every(w => s.includes(w));
  };
  // „symulacja sieci”
  await new Promise(r => setTimeout(r, 150));
  return MOCK
    .map(r => ({ ...r, score: (r.score ?? 0) + (hit(r.title) ? 0.4 : 0) + (hit(r.subtitle) ? 0.2 : 0) }))
    .filter(r => hit(r.title) || hit(r.subtitle));
}

export async function suggest(q, limit = 8) {
  const items = await searchAll({ q });
  return items.slice(0, limit);
}
