// src/lib/draftsStore.js
const LS_KEY = "lab.docs.bundles.v1";

/**
 * Struktura przechowywana:
 * {
 *   [orderId]: {
 *     orderId,
 *     ppp: {...} | null,
 *     pb:  {...} | null,
 *     kbs: [{id, ...}],
 *     logs: [{id, name, hint}],
 *     report: {...} | null,
 *     meta: { updatedAt: ISO, createdAt: ISO }
 *   }
 * }
 */

function loadAll() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}
function saveAll(db) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(db)); } catch {}
}
function nowISO() { return new Date().toISOString(); }

export function getAllBundles() {
  const db = loadAll();
  return Object.values(db)
    .sort((a, b) => String(b?.meta?.updatedAt||"").localeCompare(String(a?.meta?.updatedAt||"")));
}

export function getBundle(orderId) {
  const db = loadAll();
  return db[orderId] || null;
}

export function ensureBundle(orderId) {
  const db = loadAll();
  if (!db[orderId]) {
    db[orderId] = {
      orderId,
      ppp: null,
      pb: null,
      kbs: [],
      logs: [],
      report: null,
      meta: { createdAt: nowISO(), updatedAt: nowISO() }
    };
    saveAll(db);
  }
  return db[orderId];
}

function upsertBundle(orderId, patchFn) {
  const db = loadAll();
  const cur = db[orderId] || {
    orderId, ppp: null, pb: null, kbs: [], logs: [], report: null,
    meta: { createdAt: nowISO(), updatedAt: nowISO() }
  };
  const next = patchFn(cur);
  next.meta = { ...(next.meta||{}), updatedAt: nowISO(), createdAt: next.meta?.createdAt || cur.meta?.createdAt || nowISO() };
  db[orderId] = next;
  saveAll(db);
  return next;
}

/** ===== ZAPISY (z automatycznym „chainowaniem”) ===== **/
export function savePPP(orderId, ppp, { createPBIfMissing = true } = {}) {
  return upsertBundle(orderId, (b) => {
    b.ppp = { ...ppp };
    // auto-chain: jeśli nie ma PB → utwórz szkic
    if (createPBIfMissing && !b.pb) {
      b.pb = {
        id: `pb-${orderId}`,
        programNumber: "",
        contractNumber: ppp?.contractNumber || "",
        orderType: ppp?.orderType || "",
        subject: "",
        startDate: "",
        endDate: "",
        preparedBy: "",
        checkedBy: "",
        verifiedBy: "",
        rows: [],
        notes: "",
        _seededBy: "PPP"
      };
    }
    return b;
  });
}

export function savePB(orderId, pb, { createKBsFromRows = true } = {}) {
  return upsertBundle(orderId, (b) => {
    b.pb = { ...pb };
    // auto-chain: jeśli chcemy zasilić szkice KB z wierszy PB
    if (createKBsFromRows) {
      const toAdd = [];
      (pb?.rows || []).forEach((r, idx) => {
        const id = `kb-${orderId}-${idx+1}`;
        if (!b.kbs.some(k => k.id === id)) {
          toAdd.push({
            id,
            title: r?.feature || "Badanie",
            method: r?.method || "",
            sampleNos: r?.sampleNo ? [r.sampleNo] : [],
            equipment: r?.equipment || "",
            requirements: "",
            uncertainty: "",
            result: "",
            resultAssessment: "",
            calculations: "",
            params: "",
            units: "",
            description: "",
            environment: "",
            attachments: [],
            _seededBy: "PB"
          });
        }
      });
      if (toAdd.length) b.kbs = [...b.kbs, ...toAdd];
    }
    return b;
  });
}

export function upsertKB(orderId, kb) {
  return upsertBundle(orderId, (b) => {
    const idx = (b.kbs||[]).findIndex(x => x.id === kb.id);
    if (idx === -1) b.kbs = [...(b.kbs||[]), kb];
    else b.kbs = b.kbs.map((x,i) => i===idx ? kb : x);
    return b;
  });
}

export function addLogMeta(orderId, logMeta) {
  return upsertBundle(orderId, (b) => {
    b.logs = [...(b.logs||[]), { id: logMeta.id || `log-${Date.now()}`, ...logMeta }];
    return b;
  });
}

export function saveReport(orderId, report) {
  return upsertBundle(orderId, (b) => { b.report = { ...report }; return b; });
}

/** ===== Podsumowanie statusu (dla list) ===== **/
export function computeStatus(b) {
  if (!b) return "—";
  const flags = [
    b.ppp ? "PPP✓" : "PPP–",
    b.pb  ? "PB✓"  : "PB–",
    (b.kbs?.length||0) ? `KB×${b.kbs.length}` : "KB–",
    (b.logs?.length||0) ? `Logi×${b.logs.length}` : "Logi–",
    b.report ? "S✓" : "S–"
  ];
  return flags.join(" · ");
}
