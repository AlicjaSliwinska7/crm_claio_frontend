import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, Check, Plus, Trash2, Calendar, Tag as TagIcon, Users, Upload, Save,
} from "lucide-react";
import "../styles/task-new.css";

/**
 * NewTask — tworzenie zadania niezależnego od procesów.
 * Props:
 *  - people: string[] (lista pracowników do przydziału)
 *  - onCreate?: (task) => void   // jeśli nie podasz, pokaże alert z JSON (mock)
 */
export default function NewTask({ people = [], onCreate }) {
  const navigate = useNavigate();

  // --- model formularza ---
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("normal"); // low | normal | high
  const [dueDate, setDueDate] = useState("");
  const [startDate, setStartDate] = useState("");
  const [assignees, setAssignees] = useState([]);
  const [labels, setLabels] = useState(""); // CSV
  const [desc, setDesc] = useState("");
  const [checklist, setChecklist] = useState([{ id: rid(), text: "", done: false }]);
  const [files, setFiles] = useState([]); // mock: FileList → [{name,size}]

  const canSave = useMemo(() => title.trim().length > 2, [title]);

  function rid() {
    return Math.random().toString(36).slice(2, 9);
  }

  function handleAssigneesChange(e) {
    const opts = Array.from(e.target.selectedOptions).map((o) => o.value);
    setAssignees(opts);
  }

  function addChecklistItem() {
    setChecklist((prev) => [...prev, { id: rid(), text: "", done: false }]);
  }

  function updateChecklistItem(id, patch) {
    setChecklist((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  }

  function removeChecklistItem(id) {
    setChecklist((prev) => prev.filter((it) => it.id !== id));
  }

  function onPickFiles(e) {
    const list = Array.from(e.target.files || []);
    setFiles((prev) => [...prev, ...list.map((f) => ({ name: f.name, size: f.size }))]);
    e.target.value = ""; // reset
  }

  function clearForm() {
    setTitle("");
    setPriority("normal");
    setDueDate("");
    setStartDate("");
    setAssignees([]);
    setLabels("");
    setDesc("");
    setChecklist([{ id: rid(), text: "", done: false }]);
    setFiles([]);
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!canSave) return;

    // brak pól typu orderId/workflowId -> zadanie nie jest związane z procesem głównym
    const task = {
      id: `T-${Date.now().toString(36).toUpperCase()}`,
      title: title.trim(),
      status: "do zrobienia",
      priority,
      startDate: startDate || null,
      dueDate: dueDate || null,
      assignees: [...assignees],
      labels: splitLabels(labels),
      description: desc?.trim() || "",
      checklist: checklist
        .map((c) => ({ text: (c.text || "").trim(), done: !!c.done }))
        .filter((c) => c.text.length > 0),
      attachments: files, // mock
      createdAt: new Date().toISOString(),
      createdBy: "currentUser", // mock
      // brak powiązań: no orderId, no sampleId, no workflowId
    };

    if (onCreate) {
      onCreate(task);
    } else {
      alert("Utworzone (mock):\n\n" + JSON.stringify(task, null, 2));
    }

    // po zapisie możesz iść do /zadania/moje lub /zadania/zestawienie
    navigate("/zadania/moje");
  }

  return (
    <div className="taskNew-wrap">
      <div className="taskNew-head">
        <button className="btn ghost" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} />
          <span>Wróć</span>
        </button>
        <div className="spacer" />
        <button className="btn outline" type="button" onClick={clearForm}>Wyczyść</button>
        <button className="btn primary" type="submit" onClick={handleSubmit} disabled={!canSave}>
          <Save size={16} />
          <span>Zapisz zadanie</span>
        </button>
      </div>

      <form className="taskNew-form" onSubmit={handleSubmit}>
        <section className="card">
          <h2>Nowe zadanie</h2>
          <div className="grid two">
            <label className="field">
              <span>Tytuł <b className="req">*</b></span>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Krótki opis zadania…"
                required
              />
              <small className="hint">Minimum 3 znaki. Bez numerów zleceń i powiązań procesowych.</small>
            </label>

            <label className="field">
              <span>Priorytet</span>
              <select value={priority} onChange={(e) => setPriority(e.target.value)}>
                <option value="low">niski</option>
                <option value="normal">normalny</option>
                <option value="high">wysoki</option>
              </select>
            </label>

            <label className="field">
              <span><Calendar size={14} style={{marginRight:6}}/>Data startu</span>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </label>

            <label className="field">
              <span><Calendar size={14} style={{marginRight:6}}/>Termin (deadline)</span>
              <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </label>

            <label className="field">
              <span><Users size={14} style={{marginRight:6}}/>Osoby odpowiedzialne</span>
              <select multiple value={assignees} onChange={handleAssigneesChange} className="multi">
                {(people || []).map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
              <small className="hint">Przytrzymaj Ctrl/Cmd aby zaznaczyć wielu.</small>
            </label>

            <label className="field">
              <span><TagIcon size={14} style={{marginRight:6}}/>Tagi (oddzielone przecinkami)</span>
              <input
                type="text"
                value={labels}
                onChange={(e) => setLabels(e.target.value)}
                placeholder="np. priorytet, serwis, klient wewnętrzny"
              />
            </label>
          </div>
        </section>

        <section className="card">
          <h3>Opis</h3>
          <textarea
            rows={6}
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="Szczegóły, oczekiwany efekt, kontekst…"
          />
        </section>

        <section className="card">
          <div className="row header">
            <h3>Checklista</h3>
            <button type="button" className="btn outline" onClick={addChecklistItem}>
              <Plus size={16} /> Dodaj pozycję
            </button>
          </div>

          <div className="checklist">
            {checklist.map((it, idx) => (
              <div className="checkline" key={it.id}>
                <label className="ch">
                  <input
                    type="checkbox"
                    checked={!!it.done}
                    onChange={(e) => updateChecklistItem(it.id, { done: e.target.checked })}
                  />
                  <span><Check size={14} /></span>
                </label>
                <input
                  className="chtext"
                  type="text"
                  value={it.text}
                  onChange={(e) => updateChecklistItem(it.id, { text: e.target.value })}
                  placeholder={`Pozycja #${idx + 1}`}
                />
                <button
                  type="button"
                  className="icon danger"
                  onClick={() => removeChecklistItem(it.id)}
                  title="Usuń"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="card">
          <h3>Załączniki (mock)</h3>
          <div className="row">
            <label className="btn outline">
              <Upload size={16} />
              <span>Dodaj pliki</span>
              <input type="file" multiple onChange={onPickFiles} style={{ display: "none" }} />
            </label>
            {files.length > 0 && <span className="muted">{files.length} plik(i)</span>}
          </div>
          {files.length > 0 && (
            <ul className="files">
              {files.map((f, i) => (
                <li key={i}>
                  <span className="dot" /> {f.name} <em>({formatSize(f.size)})</em>
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="actions">
          <button className="btn outline" type="button" onClick={() => navigate(-1)}>
            Anuluj
          </button>
          <button className="btn primary" type="submit" disabled={!canSave}>
            Zapisz zadanie
          </button>
        </div>
      </form>
    </div>
  );
}

/* ===== helpers ===== */
function splitLabels(s) {
  return String(s || "")
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
}

function formatSize(n) {
  if (!n && n !== 0) return "—";
  const kb = n / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(2)} MB`;
}
