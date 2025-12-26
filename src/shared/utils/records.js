// Fabryki rekordów / bezpieczne klonowanie

const _clone = (obj) => {
  if (obj == null || typeof obj !== 'object') return obj
  if (typeof structuredClone === 'function') return structuredClone(obj)
  // fallback — wystarczający do prostych obiektów formularzy
  return JSON.parse(JSON.stringify(obj))
}

/**
 * Tworzy fabrykę pustych rekordów z domyślnymi wartościami.
 * Może przyjąć stały obiekt lub funkcję (np. zależną od kontekstu użytkownika).
 *
 * Przykład:
 *   const makeEmptyShoppingItem = makeEmptyRecord((userName) => ({
 *     name: '', category: 'biuro', quantity: 1, addedBy: userName, ...
 *   }))
 *   const draft = makeEmptyShoppingItem(currentUserName)
 */
export const makeEmptyRecord = (defaultsOrFn) => (...args) => {
  const base =
    typeof defaultsOrFn === 'function' ? defaultsOrFn(...args) : defaultsOrFn || {}
  return _clone(base)
}

/**
 * Wersja z nadpisaniem pól:
 *   const draft = makeEmptyRecordWith(defaults)(overrides, ctx...)
 */
export const makeEmptyRecordWith =
  (defaultsOrFn) =>
  (overrides = {}, ...args) => {
    const base =
      typeof defaultsOrFn === 'function'
        ? defaultsOrFn(...args)
        : defaultsOrFn || {}
    return { ..._clone(base), ..._clone(overrides) }
  }
