// src/features/board/utils/boardTableAdapter.js
import { format, parseISO, isValid } from 'date-fns'
import { pl } from 'date-fns/locale'

const safeArr = (v) => (Array.isArray(v) ? v : [])

function toDateSafe(d) {
  if (!d) return null
  if (d instanceof Date) return isValid(d) ? d : null
  try {
    const dt = parseISO(String(d))
    return isValid(dt) ? dt : null
  } catch {
    return null
  }
}

/**
 * SSOT: normalizacja "wiersza tablicy" dla Board i BoardPreview.
 * Zwraca obiekt gotowy zarówno do DataTableWithActions (Board),
 * jak i do lekkiej tabeli preview (BoardFlatTable).
 */
export function adaptBoardRow(p) {
  const createdAt = toDateSafe(p?.date) || null
  const targetDay = toDateSafe(p?.targetDate ?? p?.date) || null

  const tags = safeArr(p?.tags).filter(Boolean)
  const mentions = safeArr(p?.mentions).filter(Boolean)

  return {
    // zachowaj oryginał (przydaje się w preview do openEdit)
    original: p,

    // klucze domenowe (DataTableWithActions ich używa)
    id: p?.id ?? `${p?.author ?? 'row'}-${p?.title ?? '—'}`,
    date: p?.date ?? '',
    targetDate: p?.targetDate ?? '',

    title: p?.title ?? '',
    author: p?.author ?? '',
    type: p?.type ?? 'post',
    priority: p?.priority ?? '',

    tags,
    mentions,

    // pola pomocnicze (SSOT do sortowania i display)
    createdAt,
    targetDay,
    dayText: targetDay ? format(targetDay, 'dd.MM.yyyy', { locale: pl }) : '—',
  }
}

export function adaptBoardRows(rows) {
  return safeArr(rows).map(adaptBoardRow)
}

export { toDateSafe }