// src/components/pages/contents/OffersList.jsx
import React, { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ChevronRight, Filter, MoreHorizontal, Plus, Search, X, FilePlus2, Database } from "lucide-react";
import "../styles/offers.css";

/**
 * OffersList — lista ofert (frontend, mock data, bez shadcn/ui).
 * - czysty React + własny CSS (offers.css)
 * - nawigacja do Offer.jsx przez /sprzedaz/oferty/:id lub /dokumentacja/oferty/:id
 * - przycisk „Załaduj przykładowe” podmienia listę na DEMO_OFFERS (w tym OFT-004_2025)
 */

// Zestaw początkowy (krótszy)
const DEFAULT_OFFERS = [
  {
    id: "OF-2025-001",
    client: "ABC Sp. z o.o.",
    subject: "Badania akumulatorów litowo-jonowych – seria X",
    value: 12450,
    currency: "PLN",
    validUntil: "2025-06-30",
    status: "sent",
    language: "PL",
    reportForm: "elektroniczna",
    tests: [
      { doc: "PN-EN 61960-3:2017", feature: "Pojemność", point: "7.3", acc: "A" },
      { doc: "PN-EN 62133-2:2017", feature: "Cyklowanie", point: "8.4", acc: "NA" },
    ],
    notes: "Wycena bez kosztów logistycznych. Termin: 20 dni roboczych.",
  },
  {
    id: "OF-2025-003",
    client: "Voltix GmbH",
    subject: "Test żywotności – pakiety 10s2p",
    value: 18400,
    currency: "PLN",
    validUntil: "2025-06-10",
    status: "draft",
    language: "EN",
    reportForm: "elektroniczna",
    tests: [{ doc: "IEC 61960-3", feature: "Endurance", point: "7.8", acc: "NA" }],
    notes: "Oczekuje potwierdzenia zakresu cykli.",
  },
];

// Zestaw demonstracyjny (pełniejszy) — zawiera OFT-004_2025 (accepted)
const DEMO_OFFERS = [
  ...DEFAULT_OFFERS,
  {
    id: "OF-2025-002",
    client: "BatteryTech S.A.",
    subject: "Weryfikacja prądu rozruchowego [EN] — linia ProStart",
    value: 9800,
    currency: "PLN",
    validUntil: "2025-07-15",
    status: "accepted",
    language: "PL/EN",
    reportForm: "oba",
    tests: [{ doc: "PN-EN 50342-1:2016", feature: "Zdolność rozruchowa", point: "5.4", acc: "A" }],
    notes: "Akredytacja wymagana. W cenie 2 egz. sprawozdania papierowego.",
  },
  {
    id: "OFT-004_2025", // Twoja „żywa” przykładowa
    client: "BatteryTech S.A.",
    subject: "Weryfikacja cykli ładowania — ogniwa 18650 (seria BT-PRO)",
    value: 9900,
    currency: "PLN",
    validUntil: "2025-10-15",
    status: "accepted", // aktywuje „Utwórz zlecenie”
    language: "PL/EN",
    reportForm: "elektroniczna",
    tests: [
      { doc: "PN-EN 61960-3:2017", feature: "Pojemność nominalna", point: "7.3", acc: "A" },
      { doc: "PN-EN 61960-3:2017", feature: "Retencja pojemności", point: "7.8", acc: "NA" },
    ],
    notes: "Termin realizacji 15 dni roboczych; zakres zgodnie z zapytaniem klienta z 12.09.",
  },
];

const STATUS_META = {
  draft: { label: "szkic", className: "badge draft" },
  sent: { label: "wysłana", className: "badge sent" },
  accepted: { label: "zaakceptowana", className: "badge accepted" },
  rejected: { label: "odrzucona", className: "badge rejected" },
};

const currency = (n, c = "PLN") =>
  new Intl.NumberFormat("pl-PL", { style: "currency", currency: c }).format(n);

function StatusBadge({ status }) {
  const meta = STATUS_META[status] || STATUS_META.draft;
  return <span className={meta.className}>{meta.label}</span>;
}

export default function OffersList({ initial = DEFAULT_OFFERS, onCreateOrder }) {
  const [offers, setOffers] = useState(initial);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [menuOpen, setMenuOpen] = useState(null);

  const location = useLocation();
  const navigate = useNavigate();

  // Ustal bazę ścieżki: /sprzedaz vs /dokumentacja
  const base = location.pathname.startsWith("/dokumentacja") ? "/dokumentacja" : "/sprzedaz";

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return offers
      .filter((o) => (status ? o.status === status : true))
      .filter((o) => (q ? [o.id, o.client, o.subject].some((f) => String(f).toLowerCase().includes(q)) : true));
  }, [offers, query, status]);

  const addOffer = () => {
    const n = offers.length + 1;
    const item = {
      id: `OF-2025-${String(n).padStart(3, "0")}`,
      client: "Nowy klient Sp. z o.o.",
      subject: "Nowa oferta (przykład)",
      value: 10000 + 500 * n,
      currency: "PLN",
      validUntil: new Date(Date.now() + 1000 * 3600 * 24 * 30).toISOString().slice(0, 10),
      status: "draft",
      language: "PL",
      reportForm: "elektroniczna",
      tests: [],
      notes: "",
    };
    setOffers([item, ...offers]);
  };

  const loadDemo = () => {
    setOffers(DEMO_OFFERS);
    setStatus(""); // wyczyść filtr by było widać pełny zestaw
    setQuery("");
  };

  const openDetails = (offer) => {
    navigate(`${base}/oferty/${encodeURIComponent(offer.id)}`, { state: { offer } });
  };

  const handleCreateOrder = (offer) => {
    if (onCreateOrder) return onCreateOrder(offer);
    alert(`Utwórz zlecenie na podstawie: ${offer.id}`);
  };

  return (
    <div className="offers-wrap">
      {/* Nagłówek */}
      <div className="offers-header">
        <h1>Dokumentacja / Oferty</h1>
        <p>Lista ofert (frontend, dane przykładowe). Przejdź do szczegółów lub utwórz zlecenie.</p>
      </div>

      {/* Toolbar */}
      <div className="offers-toolbar">
        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <div className="offers-input">
            <Search style={{ position: "absolute", left: 8, top: 10, width: 16, height: 16, color: "#9ca3af" }} />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Szukaj: klient, temat, ID…" />
          </div>

          <div className="offers-select">
            <span style={{ color: "#4b5563", fontSize: 14, display: "inline-flex", alignItems: "center" }}>
              <Filter style={{ width: 16, height: 16, marginRight: 4 }} /> Status:
            </span>
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">— wszystkie —</option>
              <option value="draft">szkic</option>
              <option value="sent">wysłana</option>
              <option value="accepted">zaakceptowana</option>
              <option value="rejected">odrzucona</option>
            </select>
            {status && (
              <button className="btn outline" onClick={() => setStatus("")} title="Wyczyść filtr">
                <X style={{ width: 16, height: 16 }} />
              </button>
            )}
          </div>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={loadDemo} className="btn outline" title="Załaduj zestaw demonstracyjny">
            <Database style={{ width: 16, height: 16 }} />
            Załaduj przykładowe
          </button>
          <button onClick={addOffer} className="btn">
            <Plus style={{ width: 16, height: 16 }} />
            Nowa oferta
          </button>
        </div>
      </div>

      {/* Tabela */}
      <div className="table-card">
        <div className="table-head">
          <div>ID</div>
          <div>Klient</div>
          <div>Temat</div>
          <div className="right">Wartość</div>
          <div className="center">Status</div>
          <div></div>
        </div>
        <div className="table-sep"></div>

        {filtered.map((o) => (
          <div key={o.id} className="row">
            <div className="mono">{o.id}</div>
            <div>{o.client}</div>
            <div className="truncate" title={o.subject}>{o.subject}</div>
            <div className="right">{currency(o.value, o.currency)}</div>
            <div className="center"><StatusBadge status={o.status} /></div>
            <div style={{ display: "flex", justifyContent: "end", gap: 6 }}>
              <button className="btn outline" onClick={() => openDetails(o)}>
                Szczegóły <ChevronRight style={{ width: 16, height: 16 }} />
              </button>

              <div className="row-menu">
                <button
                  className="btn icon"
                  onClick={() => setMenuOpen(menuOpen === o.id ? null : o.id)}
                  aria-label="Więcej"
                >
                  <MoreHorizontal style={{ width: 18, height: 18 }} />
                </button>
                {menuOpen === o.id && (
                  <div className="menu">
                    <button onClick={() => openDetails(o)}>Otwórz</button>
                    <button onClick={() => alert("Edytuj – mock")}>Edytuj</button>
                    <div className="sep"></div>
                    <button
                      disabled={o.status !== "accepted"}
                      onClick={() => handleCreateOrder(o)}
                      style={o.status !== "accepted" ? { opacity: 0.5, cursor: "not-allowed" } : {}}
                    >
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                        <FilePlus2 style={{ width: 16, height: 16 }} /> Utwórz zlecenie
                      </span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="row" style={{ justifyContent: "center", color: "#6b7280" }}>
            Brak wyników.
          </div>
        )}
      </div>
    </div>
  );
}
