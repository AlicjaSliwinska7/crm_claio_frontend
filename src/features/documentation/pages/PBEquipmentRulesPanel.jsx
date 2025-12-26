import React, { useEffect, useMemo, useState } from "react";

/**
 * Prosty panel konfiguracji reguł:
 *  - [{ regex: string, equipment: string }]
 *  - kolejność ma znaczenie (pierwsze dopasowanie wygrywa)
 *  - import/eksport JSON, test na żywo
 */
export default function PBEquipmentRulesPanel({
  rules,
  setRules,
  onClose,
  defaultRules = [],
  storageKey, // opcjonalnie: klucz do localStorage (per-lab)
}) {
  const [draft, setDraft] = useState(rules || []);
  const [testInput, setTestInput] = useState("");

  useEffect(() => setDraft(rules || []), [rules]);

  const addRule = () => setDraft((d) => [...d, { regex: "", equipment: "" }]);
  const delRule = (idx) => setDraft((d) => d.filter((_, i) => i !== idx));
  const move = (idx, dir) =>
    setDraft((d) => {
      const next = d.slice();
      const j = idx + dir;
      if (j < 0 || j >= next.length) return d;
      [next[idx], next[j]] = [next[j], next[idx]];
      return next;
    });
  const updateRule = (idx, patch) =>
    setDraft((d) => d.map((r, i) => (i === idx ? { ...r, ...patch } : r)));

  const tryMatch = useMemo(() => {
    const text = String(testInput || "");
    for (const r of draft) {
      try {
        const re = new RegExp(r.regex, "i");
        if (re.test(text)) return r;
      } catch {
        // pomiń błędne regexy w podglądzie
      }
    }
    return null;
  }, [testInput, draft]);

  const saveToLocalStorage = (arr) => {
    if (!storageKey) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(arr || []));
    } catch {}
  };

  const handleSave = () => {
    const cleaned = (draft || []).filter(
      (r) => r && String(r.regex || "").trim() && String(r.equipment || "").trim()
    );
    const valid = cleaned.filter((r) => {
      try {
        // sprawdź czy regex parsowalny
        // eslint-disable-next-line no-new
        new RegExp(r.regex, "i");
        return true;
      } catch {
        return false;
      }
    });
    setRules(valid);
    saveToLocalStorage(valid);
    onClose?.();
  };

  const restoreDefaults = () => {
    setDraft(defaultRules.slice());
  };

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(draft, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "equipment-rules.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const importJSON = (file) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const arr = JSON.parse(String(reader.result));
        if (Array.isArray(arr)) {
          setDraft(
            arr.map((x) => ({
              regex: String(x?.regex || ""),
              equipment: String(x?.equipment || ""),
            }))
          );
        }
      } catch {}
    };
    reader.readAsText(file);
  };

  return (
    <div className="card" style={{ padding: 16 }}>
      <div className="kb__actions" style={{ marginBottom: 12 }}>
        <b>Reguły podpowiedzi wyposażenia</b>
        <div className="kb__spacer" />
        <button className="ghost" type="button" onClick={onClose}>
          Zamknij
        </button>
      </div>

      <div className="hint" style={{ marginBottom: 8 }}>
        Kolejność ma znaczenie — dopasowywana jest pierwsza pasująca reguła (regex, bez /…/).
      </div>

      {draft.map((r, i) => (
        <div
          key={i}
          className="methods-docs__row"
          style={{ gridTemplateColumns: "2fr 2fr 120px 120px 40px" }}
        >
          <input
            className="i"
            placeholder="regex, np. 60095.*p\\.?\\s*6\\.1"
            value={r.regex}
            onChange={(e) => updateRule(i, { regex: e.target.value })}
          />
          <input
            className="i"
            placeholder="Wyposażenie, np. Stanowisko A1"
            value={r.equipment}
            onChange={(e) => updateRule(i, { equipment: e.target.value })}
          />
          <div style={{ display: "flex", gap: 6 }}>
            <button
              type="button"
              className="ghost"
              onClick={() => move(i, -1)}
              title="W górę"
            >
              ↑
            </button>
            <button
              type="button"
              className="ghost"
              onClick={() => move(i, 1)}
              title="W dół"
            >
              ↓
            </button>
          </div>
          <div />
          <button
            type="button"
            className="ghost"
            onClick={() => delRule(i)}
            title="Usuń"
          >
            🗑
          </button>
        </div>
      ))}

      <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
        <button type="button" className="ghost" onClick={addRule}>
          + Dodaj regułę
        </button>
        <div className="kb__spacer" />
        <label className="ghost" style={{ cursor: "pointer" }}>
          Import JSON
          <input
            type="file"
            accept="application/json"
            style={{ display: "none" }}
            onChange={(e) => e.target.files?.[0] && importJSON(e.target.files[0])}
          />
        </label>
        <button type="button" className="ghost" onClick={exportJSON}>
          Eksport JSON
        </button>
        <button type="button" className="ghost" onClick={restoreDefaults}>
          Przywróć domyślne
        </button>
        <button type="button" className="ghost" onClick={handleSave}>
          Zapisz
        </button>
      </div>

      <div className="docForm__section" style={{ marginTop: 16 }}>
        Testuj dopasowanie
      </div>
      <div
        className="methods-docs__row"
        style={{ gridTemplateColumns: "2fr 2fr" }}
      >
        <input
          className="i"
          placeholder="Wpisz metodę, np. PN-EN 60095-1:2018 p.6.2"
          value={testInput}
          onChange={(e) => setTestInput(e.target.value)}
        />
        <input
          className="i"
          disabled
          value={
            tryMatch ? tryMatch.equipment : "— brak dopasowania —"
          }
        />
      </div>
    </div>
  );
}
