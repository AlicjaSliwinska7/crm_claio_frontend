import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { useCommandPalette } from "../hooks/useCommandPalette";
import { defaultParsers } from "../parsers/specialParsers";
import "../styles/command-palette.css"; // opcjonalnie – możesz usunąć jeśli nie chcesz CSS

const overlayStyle = {
  position: "fixed", inset: 0, background: "rgba(17,24,39,.45)",
  display: "grid", placeItems: "start center", paddingTop: "10vh", zIndex: 9999
};
const cardStyle = { width: "min(860px, calc(100vw - 32px))", maxHeight: "70vh", overflow: "hidden" };

export default function CommandPalette({
  commands = [],
  recentLSKey = "cmdp.recent.v1",
  maxRecent = 8,
  enableSpecial = true,
  specialParsers = defaultParsers,
}) {
  const nav = useNavigate();
  const { state, actions } = useCommandPalette({
    commands,
    recentLSKey,
    maxRecent,
    enableSpecial,
    specialParsers,
    navigate: (path) => nav(path),
  });

  const { open, q, cursor, all, recent } = state;
  const { setOpen, setQ, setCursor, onRun, onKeyDownList } = actions;

  // trap focus + autofocus
  const dialogRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    // autofocus
    const t = setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    }, 0);

    // cycle focus w obrębie dialogu
    const onKeyDown = (e) => {
      if (e.key !== "Tab") return;
      const root = dialogRef.current;
      if (!root) return;

      const focusables = root.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const list = Array.from(focusables).filter(el => !el.hasAttribute("disabled"));
      if (!list.length) return;

      const first = list[0];
      const last = list[list.length - 1];

      if (!root.contains(document.activeElement)) {
        first.focus();
        e.preventDefault();
        return;
      }
      if (!e.shiftKey && document.activeElement === last) {
        first.focus(); e.preventDefault();
      }
      if (e.shiftKey && document.activeElement === first) {
        last.focus(); e.preventDefault();
      }
    };

    const el = dialogRef.current;
    el?.addEventListener("keydown", onKeyDown);
    return () => {
      clearTimeout(t);
      el?.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const onOverlayMouseDown = () => setOpen(false);
  const stop = (e) => e.stopPropagation();

  if (!open) return null;

  return createPortal(
    <div role="dialog" aria-modal="true" style={overlayStyle} onMouseDown={onOverlayMouseDown}>
      <div
        className="cmdp__card card"
        ref={dialogRef}
        style={cardStyle}
        onMouseDown={stop}
        aria-labelledby="cmdp-title"
      >
        <div className="cmdp__header" style={{ padding: 12, borderBottom: "1px solid #e5e7eb" }}>
          <label id="cmdp-title" htmlFor="cmdp-input" style={{ display: "none" }}>
            Paleta komend
          </label>
          <input
            id="cmdp-input"
            ref={inputRef}
            placeholder="Szukaj… (⌘/Ctrl+K) — np. „ppp o-1003”, „pb PB-2025/003”, „kb KB-23-001”…"
            value={q}
            onChange={(e) => { setQ(e.target.value); setCursor(0); }}
            className="cmdp__input i"
            aria-autocomplete="list"
            aria-controls="cmdp-list"
            onKeyDown={onKeyDownList}
            style={{ width: "100%" }}
          />
        </div>

        <div id="cmdp-list" role="listbox" className="cmdp__list" style={{ maxHeight: "50vh", overflow: "auto", padding: 8 }}>
          {all.length === 0 ? (
            <div className="kb__empty">Brak dopasowań.</div>
          ) : (
            all.map((c, i) => (
              <button
                key={c.id}
                type="button"
                role="option"
                aria-selected={i === cursor}
                onClick={() => onRun(c)}
                className={`cmdp__item ghost ${i === cursor ? "is-active" : ""}`}
                tabIndex={0}
                style={{
                  width: "100%", textAlign: "left", padding: "10px 12px",
                  background: i === cursor ? "#eff6ff" : "transparent",
                  borderRadius: 8, display: "grid",
                  gridTemplateColumns: "1fr auto", alignItems: "center", gap: 8
                }}
                onMouseEnter={() => setCursor(i)}
              >
                <div>
                  <div className="cmdp__label" style={{ fontWeight: 600 }}>{c.label}</div>
                  {c.hint ? <div className="cmdp__hint" style={{ fontSize: 12, color: "#6b7280" }}>{c.hint}</div> : null}
                </div>
                <div className="cmdp__group" style={{ fontSize: 12, color: "#6b7280" }}>
                  {c.group || (recent.includes(c.id) ? "Ostatnio" : "")}
                </div>
              </button>
            ))
          )}
        </div>

        <div className="cmdp__footer" style={{ padding: 8, borderTop: "1px solid #e5e7eb", display: "flex", gap: 8, alignItems: "center" }}>
          <kbd className="chip" title="Enter">↩︎</kbd> uruchom
          <span style={{ flex: 1 }} />
          <kbd className="chip">Esc</kbd> zamknij
        </div>
      </div>
    </div>,
    document.body
  );
}
