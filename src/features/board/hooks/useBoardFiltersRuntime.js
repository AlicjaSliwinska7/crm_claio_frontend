// src/features/board/hooks/useBoardFiltersRuntime.js
import { useMemo } from 'react'
import { safeFn } from '../utils/boardGuards'

/**
 * SSOT dla filtrów:
 * - w trybie normalnym (isPreview=false) bierze internal state + settery
 * - w trybie preview (isPreview=true) bierze wartości z propsów
 *   i daje NOOP settery (chyba że podasz zewnętrzne settery)
 *
 * Dzięki temu BoardFilters zawsze dostaje: { value, setValue } itp.
 */
export function useBoardFiltersRuntime({
  isPreview = false,

  // INTERNAL (useBoardLogic)
  internal = {},

  // EXTERNAL (props)
  external = {},

  // EXTERNAL optional setters (gdybyś kiedyś chciała sterować filtrami preview z góry)
  externalSetters = {},
} = {}) {
  return useMemo(() => {
    if (!isPreview) {
      return {
        filterType: internal.filterType,
        setFilterType: safeFn(internal.setFilterType),

        filterAuthor: internal.filterAuthor,
        setFilterAuthor: safeFn(internal.setFilterAuthor),

        filterMentioned: internal.filterMentioned,
        setFilterMentioned: safeFn(internal.setFilterMentioned),

        filterPriority: internal.filterPriority,
        setFilterPriority: safeFn(internal.setFilterPriority),

        filterTag: internal.filterTag,
        setFilterTag: safeFn(internal.setFilterTag),

        gotoDate: internal.gotoDate,
        setGotoDate: safeFn(internal.setGotoDate),
      }
    }

    // preview: wartości z propsów, settery NOOP (lub dostarczone)
    return {
      filterType: external.filterType,
      setFilterType: safeFn(externalSetters.setFilterType),

      filterAuthor: external.filterAuthor,
      setFilterAuthor: safeFn(externalSetters.setFilterAuthor),

      filterMentioned: external.filterMentioned,
      setFilterMentioned: safeFn(externalSetters.setFilterMentioned),

      filterPriority: external.filterPriority,
      setFilterPriority: safeFn(externalSetters.setFilterPriority),

      filterTag: external.filterTag,
      setFilterTag: safeFn(externalSetters.setFilterTag),

      // gotoDate w preview może być opcjonalne — jeśli nie masz w propsach, będzie undefined
      gotoDate: external.gotoDate,
      setGotoDate: safeFn(externalSetters.setGotoDate),
    }
  }, [isPreview, internal, external, externalSetters])
}

export default useBoardFiltersRuntime