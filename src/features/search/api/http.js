// src/app/api/http.js
const API_BASE = import.meta?.env?.VITE_API_BASE || '';

function buildUrl(path, params) {
  const url = new URL(path, API_BASE || window.location.origin);
  if (params) Object.entries(params).forEach(([k,v]) => url.searchParams.set(k, v));
  return url.toString();
}

export async function getJSON(path, params) {
  const url = buildUrl(path, params);
  const res = await fetch(url, {
    method: 'GET',
    headers: { Accept: 'application/json' },
    credentials: 'include',
  });
  const ct = res.headers.get('content-type') || '';
  const txt = await res.text();

  if (!res.ok) {
    throw new Error(`HTTP ${res.status} ${res.statusText}\n${txt.slice(0,200)}`);
  }
  if (!ct.includes('application/json')) {
    throw new Error(`Expected JSON, got "${ct || 'unknown'}"\n${txt.slice(0,200)}`);
  }
  try {
    return JSON.parse(txt);
  } catch (e) {
    throw new Error(`Bad JSON payload:\n${txt.slice(0,200)}\n${e.message}`);
  }
}
