// src/app/features/search/api.js
import { getJSON } from './http'

export function getSuggestions(q) {
  // dopasuj ścieżkę do swojego backendu / proxy
  return getJSON('/api/search/suggest', { q });
}

export function searchAnything(q) {
  return getJSON('/api/search', { q });
}
