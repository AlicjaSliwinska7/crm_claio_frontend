import React, { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Search, Filter, Plus, Database, MoreHorizontal, ChevronRight, Download } from "lucide-react";
import "../styles/calc-cards.css";

/**
 * CalcCardsList — lista kart kalkulacyjnych (frontend, mock).
 * Teraz: export CSV/XLSX(HTML) + total = sum(rows) + materials.
 */

const DEMO_CARDS = [
  {
    id: "KK-2025/045",
    orderId: "ORD-001",
    orderNumber: "ZL-2025/001",
    client: "TechSolutions Sp. z o.o.",
    subject: "Tworzywo sztuczne – płyta PE (typ A)",
    status: "approved", // draft | review | approved
    createdAt: "2025-07-05",
    materials: 450,
    rows: [
      { name: "Przygotowanie próbek", qty: 3, unit: "h", unitPrice: 1800 },
      { name: "Badanie ISO 527-1 (3 pkt)", qty: 3, unit: "pkt", unitPrice: 900 },
      { name: "Materiały i odczynniki", qty: 1, unit: "ryczałt", unitPrice: 450 },
    ],
  },
  {
    id: "KK-2025/052",
    orderId: "ORD-002",
    orderNumber: "ZL-2025/002",
    client: "GreenEnergy S.A.",
    subject: "Kabel elektryczny (typ B)",
    status: "review",
    createdAt: "2025-07-10",
    materials: 200,
    rows: [
      { name: "Przyjęcie i rejestracja", qty: 1, unit: "h", unitPrice: 1100 },
      { name: "PN-EN 50395 (2 pkt)", qty: 2, unit: "pkt", unitPrice: 850 },
      { name: "Materiały pomocnicze", qty: 1, unit: "ryczałt", unitPrice: 200 },
    ],
  },
  {
    id: "KK-2025/060",
    orderId: "ORD-003",
    orderNumber: "ZL-2025/010",
    client: "Volt Sp. z o.o.",
    subject: "Akumulator 12V – test rozruchu",
    status: "draft",
    createdAt: "2025-09-18",
    materials: 300,
    rows: [
      { name: "Przygotowanie stanowiska", qty: 2, unit: "h", unitPrice: 1500 },
      { name: "Rozruch [EN] – 1 szt.", qty: 1, unit: "szt", unitPrice: 1200 },
      { name: "Materiały", qty: 1, unit: "ryczałt", unitPrice: 300 },
    ],
  },
];

const STATUS_META = {
  draft: { label: "szkic", className: "badge draft" },
  review: { label: "do przeglądu", className: "badge review" },
  approved: { label: "zatwierdzona", className: "badge approved" },
};

const PLN = (n) => new Intl.NumberFormat("pl-PL", { style: "currency", currency: "PLN" }).format(n);

function statusBadge(status) {
  const meta = STATUS_META[status] || STATUS_META.draft;
  return <span className={meta.className}>{meta.label}</span>;
}

function sumRows(rows) {
  if (!Array.isArray(rows)) return 0;
  return rows.reduce((s, r) => s + (Number(r.qty) || 0) * (Number(r.unitPrice) || 0), 0);
}
function calcTotal(card) {
  const rowsSum = sumRows(card.rows);
  const mats = Number(card.materials) || 0;
  return rowsSum + mats;
}

/* ---- Eksport CSV / XLSX(HTML) ---- */
function downloadFile({ data, mime, filename }) {
  const blob = new Blob([data], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function exportCSV(cards) {
  const header = [
    "ID karty",
    "Nr zlecenia",
    "Klient",
    "Temat",
    "Status",
    "Utworzono",
    "Materiały (PLN)",
    "Suma pozycji (PLN)",
    "Suma całkowita (PLN)",
  ];
  const rows = cards.map((c) => {
    const rowsSum = sumRows(c.rows);
    const total = rowsSum + (Number(c.materials) || 0);
    return [
      c.id,
      c.orderNumber,
      c.client,
      c.subject,
      STATUS_META[c.status]?.label || c.status || "",
      c.createdAt || "",
      (Number(c.materials) || 0).toString().replace(".", ","),
      rowsSum.toString().replace(".", ","),
      total.toString().replace(".", ","),
    ];
  });

  const csv = [header, ...rows]
    .map((r) =>
      r
        .map((cell) => {
          const val = String(cell ?? "");
          // Proste escapowanie CSV
          return /[",;\n]/.test(val) ? `"${val.replace(/"/g, '""')}"` : val;
        })
        .join(";")
    )
    .join("\n");

  downloadFile({
    data: "\uFEFF" + csv, // BOM dla Excela
    mime: "text/csv;charset=utf-8;",
    filename: `karty-kalkulacyjne_${new Date().toISOString().slice(0,10)}.csv`,
  });
}

function exportXLS(cards) {
  // Lekki „XLSX mock”: HTML table z odpowiednim MIME — Excel otwiera poprawnie.
  const rowsHtml = cards
    .map((c) => {
      const rowsSum = sumRows(c.rows);
      const total = rowsSum + (Number(c.materials) || 0);
      return `
        <tr>
          <td>${c.id}</td>
          <td>${c.orderNumber || ""}</td>
          <td>${c.client || ""}</td>
          <td>${c.subject || ""}</td>
          <td>${STATUS_META[c.status]?.label || c.status || ""}</td>
          <td>${c.createdAt || ""}</td>
          <td>${(Number(c.materials) || 0).toFixed(2).replace(".", ",")}</td>
          <td>${rowsSum.toFixed(2).replace(".", ",")}</td>
          <td>${total.toFixed(2).replace(".", ",")}</td>
        </tr>`;
    })
    .join("");

  const html =
    `<html xmlns:x="urn:schemas-microsoft-com:office:excel">
      <head>
        <meta charset="UTF-8" />
      </head>
      <body>
        <table border="1">
          <thead>
            <tr>
              <th>ID karty</th>
              <th>Nr zlecenia</th>
              <th>Klient</th>
              <th>Temat</th>
              <th>Status</th>
              <th>Utworzono</th>
              <th>Materiały (PLN)</th>
              <th>Suma pozycji (PLN)</th>
              <th>Suma całkowita (PLN)</th>
            </tr>
          </thead>
          <tbody>${rowsHtml}</tbody>
        </table>
      </body>
    </html>`;

  downloadFile({
    data: html,
    mime: "application/vnd.ms-excel;charset=utf-8;",
    filename: `karty-kalkulacyjne_${new Date().toISOString().slice(0,10)}.xls`,
  });
}

export default function CalcCardsList({ initial = DEMO_CARDS }) {
  const [cards, setCards] = useState(initial);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");

  const location = useLocation();
  const navigate = useNavigate();
  const base = location.pathname.startsWith("/dokumentacja") ? "/dokumentacja" : "/sprzedaz";

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return cards
      .map((c) => ({ ...c, __rowsSum: sumRows(c.rows), __total: calcTotal(c) })) // wzbogacone o sumy
      .filter((c) => (status ? c.status === status : true))
      .filter((c) =>
        q
          ? [c.id, c.orderNumber, c.client, c.subject].some((f) =>
              String(f).toLowerCase().includes(q)
            )
          : true
      );
  }, [cards, query, status]);

  const addCard = () => {
    const n = cards.length + 1;
    const id = `KK-2025/${String(40 + n).padStart(3, "0")}`;
    const card = {
      id,
      orderId: `ORD-${100 + n}`,
      orderNumber: `ZL-2025/${String(10 + n).padStart(3, "0")}`,
      client: "Nowy klient Sp. z o.o.",
      subject: "Nowa karta (przykład)",
      status: "draft",
      createdAt: new Date().toISOString().slice(0, 10),
      materials: 250,
      rows: [
        { name: "Pozycja przykładowa", qty: 1, unit: "h", unitPrice: 1200 },
        { name: "Materiały", qty: 1, unit: "ryczałt", unitPrice: 250 },
      ],
    };
    setCards([card, ...cards]);
  };

  const loadDemo = () => {
    setCards(DEMO_CARDS);
    setQuery("");
    setStatus("");
  };

  const openDetails = (card) => {
    navigate(`${base}/karty-kalkulacyjne/${encodeURIComponent(card.id)}`, { state: { card } });
  };

  return (
    <div className="calc-wrap">
      <div className="calc-header">
        <h1>Dokumentacja / Karty kalkulacyjne</h1>
        <p>Kosztorysy powiązane ze zleceniem. Po zatwierdzeniu widoczne w rejestrze zleceń.</p>
      </div>

      <div className="calc-toolbar">
        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <div className="calc-input">
            <Search style={{ position: "absolute", left: 8, top: 10, width: 16, height: 16, color: "#9ca3af" }} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Szukaj: ID karty, nr zlecenia, klient, temat…"
            />
          </div>
          <div className="calc-select">
            <span style={{ color: "#4b5563", fontSize: 14, display: "inline-flex", alignItems: "center" }}>
              <Filter style={{ width: 16, height: 16, marginRight: 4 }} /> Status:
            </span>
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">— wszystkie —</option>
              <option value="draft">szkic</option>
              <option value="review">do przeglądu</option>
              <option value="approved">zatwierdzona</option>
            </select>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button className="btn outline" onClick={loadDemo}>
            <Database style={{ width: 16, height: 16 }} /> Załaduj przykładowe
          </button>
          <button className="btn outline" onClick={() => exportCSV(filtered)}>
            <Download style={{ width: 16, height: 16 }} /> Eksport CSV
          </button>
          <button className="btn outline" onClick={() => exportXLS(filtered)}>
            <Download style={{ width: 16, height: 16 }} /> Eksport XLSX (HTML)
          </button>
          <button className="btn" onClick={addCard}>
            <Plus style={{ width: 16, height: 16 }} /> Nowa karta
          </button>
        </div>
      </div>

      <div className="table-card">
        <div className="table-head">
          <div>ID karty</div>
          <div>Nr zlecenia</div>
          <div>Klient</div>
          <div>Temat</div>
          <div className="center">Status</div>
          <div className="right">Suma</div>
        </div>
        <div className="table-sep"></div>

        {filtered.map((c) => (
          <div key={c.id} className="row">
            <div className="mono">{c.id}</div>
            <div>
              <a className="docLink" href={`${base}/zlecenia/${encodeURIComponent(c.orderId)}`} onClick={(e)=>e.preventDefault()}>
                {c.orderNumber}
              </a>
            </div>
            <div>{c.client}</div>
            <div title={c.subject}>{c.subject}</div>
            <div className="center">{statusBadge(c.status)}</div>
            <div className="right">{PLN(c.__total)}</div>
            <div style={{ display: "flex", justifyContent: "end", gap: 6 }}>
              <button className="btn outline" onClick={() => openDetails(c)}>
                Szczegóły <ChevronRight style={{ width: 16, height: 16 }} />
              </button>
              <button className="btn icon" title="Więcej" onClick={() => alert('Menu akcji – mock')}>
                <MoreHorizontal style={{ width: 18, height: 18 }} />
              </button>
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
