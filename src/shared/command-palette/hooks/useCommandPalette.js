import { useEffect, useMemo, useState } from "react";

/**
 * Logika palety komend: skróty klawiaturowe, recent (LS), filtrowanie, uruchamianie.
 *
 * @param {Object} opts
 * @param {Array}  opts.commands - [{id,label,keywords?,hint?,action(navigate),group?}]
 * @param {string} opts.recentLSKey
 * @param {number} opts.maxRecent
 * @param {boolean} opts.enableSpecial
 * @param {Array<Function>} opts.specialParsers - [(q, navigate) => Command[]]
 * @param {Function} opts.navigate - wrapper na react-router useNavigate (path => void)
 */
export function useCommandPalette({
  commands = [],
  recentLSKey = "cmdp.recent.v1",
  maxRecent = 8,
  enableSpecial = true,
  specialParsers = [],
  navigate,
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [cursor, setCursor] = useState(0);
  const [recent, setRecent] = useState(() => {
    try { return JSON.parse(localStorage.getItem(recentLSKey)) || []; } catch { return []; }
  });

  // global: ⌘/Ctrl+K otwiera/zamyka, Esc zamyka
  useEffect(() => {
    const onKey = (e) => {
      const mod = e.ctrlKey || e.metaKey;
      if (mod && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(v => !v);
      }
      if (open && e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // komendy „specjalne” z parserów
  const special = useMemo(() => {
    if (!enableSpecial || !q.trim()) return [];
    return specialParsers.flatMap((fn) => {
      try { return fn(q, navigate) || []; } catch { return []; }
    });
  }, [q, enableSpecial, specialParsers, navigate]);

  // proste fuzzy: includes na label + keywords
  const all = useMemo(() => {
    const norm = (s) => (s || "").toLowerCase().normalize("NFKD");
    const query = norm(q);

    const base = q.trim()
      ? commands.filter(c => norm(`${c.label} ${c.keywords || ""}`).includes(query))
      : commands;

    const list = [...special, ...base];

    if (!q.trim() && recent.length) {
      const byId = new Map(list.map(c => [c.id, c]));
      const recItems = recent.map(id => byId.get(id)).filter(Boolean);
      const others = list.filter(c => !recent.includes(c.id));
      return [...recItems, ...others];
    }
    return list;
  }, [q, commands, special, recent]);

  const onRun = (cmd) => {
    setOpen(false);
    const next = [cmd.id, ...recent.filter(id => id !== cmd.id)].slice(0, maxRecent);
    setRecent(next);
    try { localStorage.setItem(recentLSKey, JSON.stringify(next)); } catch {}
    if (typeof cmd.action === "function") cmd.action(navigate);
  };

  const onKeyDownList = (e) => {
    if (!open) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setCursor(c => Math.min(c + 1, all.length - 1)); }
    if (e.key === "ArrowUp")   { e.preventDefault(); setCursor(c => Math.max(c - 1, 0)); }
    if (e.key === "Enter")     { e.preventDefault(); const cmd = all[cursor]; if (cmd) onRun(cmd); }
  };

  return {
    state: { open, q, cursor, all, recent },
    actions: { setOpen, setQ, setCursor, onRun, onKeyDownList },
  };
}
