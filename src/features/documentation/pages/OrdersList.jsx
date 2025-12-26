// src/components/pages/contents/OrdersList.jsx
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useModal } from "../../../app/providers/GlobalModalProvider";

const ORDER_DETAILS_BASE = "/dokumentacja/zlecenia";

const STATUS_COLOR_VAR = {
  "w przygotowaniu": "var(--doc-amber)",
  "wysłane": "var(--doc-blue)",
  "podpisane": "var(--doc-indigo)",
  "zarejestrowane": "var(--doc-green)",
};

function getByPath(obj, path) {
  return path.split(".").reduce((acc, key) => (acc ? acc[key] : undefined), obj);
}

function computeCompletion(order) {
  const required = [
    "client.name",
    "client.email",
    "invoice.address",
    "order.subject",
    "order.description",
    "order.sampleSize",
    "order.language",
    "order.deliveryForm",
    "order.copies",
  ];

  const values = required.map((p) => getByPath(order, p));
  const filledBasic = values.filter(
    (v) =>
      v !== undefined &&
      v !== null &&
      String(v).trim() !== "" &&
      !(typeof v === "number" && Number.isNaN(v))
  ).length;

  const methods = order?.order?.methods || [];
  const hasMethod = methods.length > 0;
  const hasMethodDetails =
    hasMethod &&
    methods.every(
      (m) =>
        (m.ref && String(m.ref).trim() !== "") &&
        (m.test && String(m.test).trim() !== "")
    );

  const total = required.length + 2;
  const filled = filledBasic + (hasMethod ? 1 : 0) + (hasMethodDetails ? 1 : 0);
  const percent = Math.round((filled / total) * 100);

  return { percent, filled, total, hasMethod, hasMethodDetails };
}

export default function OrdersList({
  orders = [],
  activeId = null,
  onSelect,               // (id)=>void
  onCreate,               // ()=>void
  onDelete,               // (id)=>void
  onNextStatus,           // (id)=>void
  onPrevStatus,           // (id)=>void
  onGenerateForm,         // (id)=>Promise|void
  onPreviewForm,          // (id)=>void
}) {
  const navigate = useNavigate();
  const { alert, confirm } = useModal();

  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return orders.filter((o) => {
      if (status !== "all" && o.status !== status) return false;
      if (!qq) return true;
      const hay = [
        o.id,
        o.number,
        o.client?.name,
        o.order?.subject,
        o.order?.model,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(qq);
    });
  }, [orders, q, status]);

  const handleEdit = (order) => {
    // od razu tryb edycji:
    navigate(`${ORDER_DETAILS_BASE}/${order.id}?edit=1`, { state: { order } });
  };

  const handleOpen = (order) => {
    // podgląd (bez przełączania w edycję)
    navigate(`${ORDER_DETAILS_BASE}/${order.id}`, { state: { order } });
  };

  const handleDelete = async (id) => {
    const ok = await confirm({
      title: "Usunąć zlecenie?",
      message:
        "Tej operacji nie można cofnąć.\nCzy na pewno chcesz usunąć to zlecenie?",
      tone: "danger",
      confirmText: "Usuń",
      cancelText: "Anuluj",
    });
    if (!ok) return;
    onDelete?.(id);
  };

  const handlePreviewForm = async (order) => {
    if (onPreviewForm) return onPreviewForm(order.id);
    await alert({
      title: "Podgląd formularza (mock)",
      message:
        `Tu pokażemy wygenerowany dokument dla: ${order.number || order.id}.\n` +
        `Na razie to tylko podgląd przykładowy.`,
      tone: "info",
      okText: "Zamknij",
    });
  };

  const handleGenerate = async (order) => {
    if (onGenerateForm) {
      await onGenerateForm(order.id);
      return;
    }
    await alert({
      title: "Generowanie (mock)",
      message:
        `Wygenerowano formularz dla: ${order.number || order.id}.\n` +
        `W realnej aplikacji zaktualizujemy rekord (order.generatedForm = {...}).`,
      tone: "success",
      okText: "OK",
    });
  };

  const exportCSV = () => {
    const rows = [
      ["ID", "Numer", "Status", "Klient", "Przedmiot", "Model", "Cena netto"],
      ...filtered.map((o) => [
        o.id,
        o.number || "",
        o.status,
        o.client?.name || "",
        o.order?.subject || "",
        o.order?.model || "",
        o.payment?.priceNet || "",
      ]),
    ];
    const csv = rows
      .map((r) => r.map((x) => `"${String(x).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "zlecenia.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <aside className="docOrders__side panel">
      {/* Filtry / akcje */}
      <div className="docOrders__filters">
        <input
          className="search"
          placeholder="Szukaj po nr, kliencie, temacie…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select
          className="select"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="all">Status: wszystkie</option>
          <option value="w przygotowaniu">w przygotowaniu</option>
          <option value="wysłane">wysłane</option>
          <option value="podpisane">podpisane</option>
          <option value="zarejestrowane">zarejestrowane</option>
        </select>

        <div className="docOrders__btns">
          <button className="btn btn--primary" onClick={onCreate}>
            + Nowe zlecenie
          </button>
          <button className="btn" title="Eksportuj widok do CSV" onClick={exportCSV}>
            Eksport CSV
          </button>
        </div>
      </div>

      {/* Lista zleceń */}
      <div className="docOrders__list">
        {filtered.map((o) => {
          const { percent } = computeCompletion(o);
          const isGenerated = !!o.generatedForm;
          const badgeColor = STATUS_COLOR_VAR[o.status] || "var(--doc-slate)";

          return (
            <div
              key={o.id}
              className={
                "docOrders__item" + (activeId && activeId === o.id ? " is-active" : "")
              }
              title={`${o.number || o.id} – ${o.client?.name || "—"}`}
              onClick={() => onSelect?.(o.id)}
              onDoubleClick={() => handleOpen(o)}   // ← 2x klik: otwórz podgląd
            >
              <div className="title">{o.number || o.id}</div>
              <div className="meta">
                <span className="client">{o.client?.name || "— klient —"}</span>
                <span className="status-badge" style={{ background: badgeColor }}>
                  {o.status}
                </span>
              </div>
              <div className="subj">{o.order?.subject || "— przedmiot —"}</div>

              <div className="row-actions">
                <button
                  className="ghost sm"
                  title="Cofnij status"
                  onClick={(e) => {
                    e.stopPropagation();
                    onPrevStatus?.(o.id);
                  }}
                >
                  ←
                </button>
                <button
                  className="ghost sm"
                  title="Dalej"
                  onClick={(e) => {
                    e.stopPropagation();
                    onNextStatus?.(o.id);
                  }}
                >
                  →
                </button>

                <button
                  className="ghost sm"
                  title="Edytuj"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit(o); // ← z ?edit=1
                  }}
                >
                  ✎
                </button>

                {isGenerated ? (
                  <button
                    className="btn-icon form-icon"
                    title={`Pokaż formularz (${o.generatedForm?.fileName || "plik"})`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePreviewForm(o);
                    }}
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M14 2H8a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V8z" fill="currentColor" opacity=".12"/>
                      <path d="M14 2v4a2 2 0 0 0 2 2h4" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                      <path d="M9 13h6M9 16h6M9 19h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      <path d="M20 8l-6-6" stroke="currentColor" strokeWidth="1.5"/>
                    </svg>
                  </button>
                ) : (
                  <>
                    <div
                      className="progress-inline progress-inline--lg"
                      title={`Uzupełnienie danych: ${percent}%`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div
                        className="progress-inline__bar"
                        style={{ width: `${Math.max(6, percent)}%` }}
                      />
                      <span className="progress-inline__label">{percent}%</span>
                    </div>
                    {percent === 100 && (
                      <button
                        className="ghost sm orderItem__generate"
                        title="Wygeneruj formularz"
                        onClick={async (e) => {
                          e.stopPropagation();
                          await handleGenerate(o);
                        }}
                      >
                        Wygeneruj
                      </button>
                    )}
                  </>
                )}

                <button
                  className="ghost sm"
                  title="Usuń"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(o.id);
                  }}
                >
                  🗑
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Paginacja (mock) */}
      <div className="docOrders__pagination">
        <button disabled>⏮</button>
        <button disabled>◀</button>
        <span>1 / 1</span>
        <button disabled>▶</button>
        <button disabled>⏭</button>
      </div>
    </aside>
  );
}
