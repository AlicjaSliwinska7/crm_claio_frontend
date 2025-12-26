// src/components/pages/contents/PPP.jsx
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import "../styles/documentation-orders.css";
import { savePPP } from "../../../shared/draftsStore";

/** Mini toast (lekka kopia z OrderDetails) */
function useToast() {
  const [toast, setToast] = useState(null);
  const show = useCallback((msg, type = "info", ttl = 2400) => {
    setToast({ msg, type });
    const t = setTimeout(() => setToast(null), ttl);
    return () => clearTimeout(t);
  }, []);
  const Toast = useCallback(() => {
    if (!toast) return null;
    return (
      <div
        style={{
          position: "fixed",
          right: 16,
          bottom: 16,
          background:
            toast.type === "error"
              ? "#fecaca"
              : toast.type === "warn"
              ? "#fde68a"
              : "#dbeafe",
          border: "1px solid rgba(0,0,0,.1)",
          padding: "10px 12px",
          borderRadius: 10,
          boxShadow: "0 8px 24px rgba(0,0,0,.15)",
          zIndex: 9999,
          color: "#111827",
          fontWeight: 700,
        }}
      >
        {toast.msg}
      </div>
    );
  }, [toast]);
  return { show, Toast };
}

/**
 * PPP.jsx — Protokół Przyjęcia Próbki
 *
 * Props:
 * - order: opcjonalnie obiekt zlecenia (z OrderDetails)
 * - getOrderById: async (id) => order  (opcjonalnie; jeśli brak – render działa bez order)
 * - initialPPP: opcjonalnie istniejący protokół do edycji
 * - onSave: (ppp) => void
 * - onCancel: () => void
 */
export default function PPP({
  order: orderProp,
  getOrderById,
  initialPPP,
  onSave,
  onCancel,
}) {
  const { id } = useParams(); // orderId
  const navigate = useNavigate();
  const location = useLocation();
  const { show, Toast } = useToast();

  const orderFromState = location?.state?.order || null;

  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState(orderProp || orderFromState || null);

  // Stan PPP (to, co zapisujemy jako protokół)
  const [ppp, setPPP] = useState(() => ({
    number: "",
    acceptedAt: "", // datetime-local
    sampleCode: "",
    // KLUCZ: lustrzane pola:
    orderType: "", // 'zew' | 'wew' | 'bw'
    sampleCodeKind: { AO: false, BP: false, AZ: false, INNE: false, inneText: "" },
    // reszta pól pomocniczych
    notes: "",
    url: "",
    ...(initialPPP || {}),
  }));

  // Czy auto-sync z danymi zlecenia (prefill + aktualizacja przy zmianie order)
  const [syncWithOrder, setSyncWithOrder] = useState(true);

  // wczytaj zlecenie jeśli nie przeszło z props/route state, a mamy loader
  useEffect(() => {
    let alive = true;
    (async () => {
      if (orderProp || orderFromState) return; // już mamy order
      if (!getOrderById || !id) return;
      setLoading(true);
      try {
        const o = await Promise.resolve(getOrderById(id));
        if (alive) setOrder(o || null);
      } catch {
        if (alive) show("Nie udało się pobrać zlecenia.", "error");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, orderProp, orderFromState, getOrderById]);

  // 1:1 Prefill z order.orderType i order.sampleCodeKind
  useEffect(() => {
    if (!order || !syncWithOrder) return;
    const src = order.order || {};
    setPPP((cur) => ({
      ...cur,
      orderType: (src.orderType || cur.orderType || "").trim(),
      sampleCodeKind: {
        AO: !!(src.sampleCodeKind?.AO || cur.sampleCodeKind?.AO),
        BP: !!(src.sampleCodeKind?.BP || cur.sampleCodeKind?.BP),
        AZ: !!(src.sampleCodeKind?.AZ || cur.sampleCodeKind?.AZ),
        INNE: !!(src.sampleCodeKind?.INNE || cur.sampleCodeKind?.INNE),
        inneText: (src.sampleCodeKind?.inneText ?? cur.sampleCodeKind?.inneText ?? "").trim(),
      },
    }));
  }, [order, syncWithOrder]);

  const setField = (patch) => setPPP((cur) => ({ ...cur, ...patch }));
  const setKind = (k, v) =>
    setPPP((cur) => ({ ...cur, sampleCodeKind: { ...(cur.sampleCodeKind || {}), [k]: v } }));
  const setKindText = (v) =>
    setPPP((cur) => ({ ...cur, sampleCodeKind: { ...(cur.sampleCodeKind || {}), inneText: v } }));

  const canSave = useMemo(() => {
    const kind = ppp.sampleCodeKind || {};
    const hasKind = !!(kind.AO || kind.BP || kind.AZ || kind.INNE);
    return Boolean(
      String(ppp.number || "").trim() &&
      String(ppp.acceptedAt || "").trim() &&
      String(ppp.sampleCode || "").trim() &&
      String(ppp.orderType || "").trim() &&
      hasKind
    );
  }, [ppp]);

  const handleSave = () => {
    if (!canSave) {
      show("Uzupełnij wymagane pola: nr, data, kod próbki, rodzaj zlecenia, rodzaj kodu.", "error");
      return;
    }

    // payload do bundla + delikatne uzupełnienie contractNumber z order.number
    const payload = {
      ...ppp,
      number: String(ppp.number || "").trim(),
      sampleCode: String(ppp.sampleCode || "").trim(),
      orderType: String(ppp.orderType || "").trim(),
      contractNumber: order?.number || ppp.contractNumber || "",
    };

    try {
      // zapis do localStorage + auto-szkic PB, jeśli brak
      savePPP(id || payload.contractNumber || "unknown", payload, { createPBIfMissing: true });
      onSave?.(payload);
      show("Zapisano PPP. Utworzono szkic PB.", "info");
      // po zapisie przejdź do listy PB
      navigate("/dokumentacja/pb");
    } catch {
      show("Błąd zapisu PPP.", "error");
    }
  };

  return (
    <form
      className="docForm"
      onSubmit={(e) => {
        e.preventDefault();
        handleSave();
      }}
    >
      <div className="kb__actions">
        <div className="chips">
          <span className="chip">PPP — Protokół przyjęcia próbki</span>
          {order?.number ? (
            <span className="chip chip--ok">Zlecenie: {order.number}</span>
          ) : (
            <span
              className="chip chip--warn"
              title="Brak powiązanego zlecenia — to tylko informacja"
            >
              brak danych zlecenia
            </span>
          )}
        </div>
        <div className="kb__spacer" />
        <label
          className="f f--row"
          title="Gdy włączone — PPP zaciąga i odświeża wartości z OrderDetails"
        >
          <input
            type="checkbox"
            checked={syncWithOrder}
            onChange={(e) => setSyncWithOrder(e.target.checked)}
          />
          <span>Synchronizuj z danymi zlecenia</span>
        </label>
      </div>

      <div className="docForm__grid">
        {/* Meta PPP */}
        <label className="f">
          <span className="l">Nr protokołu *</span>
          <input
            className="i i--md"
            value={ppp.number || ""}
            onChange={(e) => setField({ number: e.target.value })}
            required
          />
        </label>
        <label className="f">
          <span className="l">Przyjęto (data i godz.) *</span>
          <input
            type="datetime-local"
            className="i i--md"
            value={ppp.acceptedAt || ""}
            onChange={(e) => setField({ acceptedAt: e.target.value })}
            required
          />
        </label>
        <label className="f f--span2">
          <span className="l">Kod(y) próbek *</span>
          <input
            className="i i--lg"
            value={ppp.sampleCode || ""}
            onChange={(e) => setField({ sampleCode: e.target.value })}
            required
          />
        </label>

        {/* Lustrzane: rodzaj zlecenia */}
        <div className="docForm__section f--span3">Parametry przeniesione ze zlecenia</div>
        <label className="f f--span3">
          <span className="l">Rodzaj zlecenia *</span>
          <div className="f f--row" style={{ flexWrap: "wrap", gap: 8 }}>
            {[
              { key: "zew", label: "ZEW — zewnętrzne" },
              { key: "wew", label: "WEW — wewnętrzne" },
              { key: "bw", label: "BW — badania własne" },
            ].map((opt) => (
              <label
                key={opt.key}
                className={`chip ${ppp.orderType === opt.key ? "chip--ok" : ""}`}
                style={{ cursor: "pointer" }}
              >
                <input
                  type="radio"
                  name="pppOrderType"
                  checked={ppp.orderType === opt.key}
                  onChange={() => setField({ orderType: opt.key })}
                />
                <span>{opt.label}</span>
              </label>
            ))}
          </div>
        </label>

        {/* Lustrzane: rodzaj kodu próbki */}
        <label className="f f--span3">
          <span className="l">Rodzaj kodu próbki *</span>
          <div className="f f--row" style={{ flexWrap: "wrap", gap: 8 }}>
            {[
              { key: "AO", label: "AO — akumulatory ołowiowe" },
              { key: "BP", label: "BP — baterie pierwotne" },
              { key: "AZ", label: "AZ — akumulatory zasadowe" },
            ].map((opt) => (
              <label
                key={opt.key}
                className={`chip ${ppp.sampleCodeKind?.[opt.key] ? "chip--ok" : ""}`}
                style={{ cursor: "pointer" }}
              >
                <input
                  type="checkbox"
                  checked={!!ppp.sampleCodeKind?.[opt.key]}
                  onChange={(e) => setKind(opt.key, e.target.checked)}
                />
                <span>{opt.label}</span>
              </label>
            ))}
            <label
              className={`chip ${ppp.sampleCodeKind?.INNE ? "chip--ok" : ""}`}
              style={{ cursor: "pointer" }}
            >
              <input
                type="checkbox"
                checked={!!ppp.sampleCodeKind?.INNE}
                onChange={(e) => setKind("INNE", e.target.checked)}
              />
              <span>Inne</span>
            </label>
            <input
              className="i i--sm"
              style={{ marginLeft: 8, minWidth: 220 }}
              placeholder="doprecyzuj (jeśli Inne)"
              value={ppp.sampleCodeKind?.inneText || ""}
              onChange={(e) => setKindText(e.target.value)}
            />
          </div>
        </label>

        {/* Załącznik / URL */}
        <label className="f f--span3">
          <span className="l">URL protokołu (PDF)</span>
          <input
            className="i i--lg"
            value={ppp.url || ""}
            onChange={(e) => setField({ url: e.target.value })}
            placeholder="https://…"
          />
        </label>

        {/* Uwagi */}
        <label className="f f--span3">
          <span className="l">Uwagi</span>
          <textarea
            className="i t"
            value={ppp.notes || ""}
            onChange={(e) => setField({ notes: e.target.value })}
          />
        </label>
      </div>

      <div className="kb__actions">
        <div className="kb__spacer" />
        <button type="submit" className="ghost" disabled={!canSave}>
          Zapisz
        </button>
        {onCancel ? (
          <button type="button" className="ghost" onClick={onCancel}>
            Anuluj
          </button>
        ) : (
          <button type="button" className="ghost" onClick={() => navigate(-1)}>
            Wstecz
          </button>
        )}
      </div>

      <Toast />
    </form>
  );
}
