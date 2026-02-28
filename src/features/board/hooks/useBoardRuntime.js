// src/features/board/hooks/useBoardRuntime.js
import { useMemo } from 'react'
import { safeArray, safeFn, resolveFilteredSelector } from '../utils/boardGuards'

/**
 * SSOT: spina źródła danych (internal hook vs props preview).
 * Zwraca "runtime" – gotowe, bezpieczne wartości do renderu.
 */
export function useBoardRuntime({
  isPreview = false,

  // INTERNAL (z useBoardLogic)
  internalPosts,
  internalSetPosts,
  internalSelectedPost,
  internalSetSelectedPost,
  internalSetEditMode,
  internalFilteredEntries,

  // EXTERNAL (z props – dla preview/embed)
  externalPosts,
  externalSetPosts,
  externalSelectedPost,
  externalSetSelectedPost,
  externalSetEditMode,
  externalFilteredEntries,

  // Day control
  internalSetCurrentDay,
  externalSetCurrentDay,

  // Click handler
  onDayClick,
} = {}) {
  return useMemo(() => {
    const posts = isPreview ? externalPosts : internalPosts
    const setPosts = isPreview ? externalSetPosts : internalSetPosts

    const selectedPost = isPreview ? externalSelectedPost : internalSelectedPost
    const setSelectedPost = isPreview ? externalSetSelectedPost : internalSetSelectedPost

    const setEditMode = isPreview ? externalSetEditMode : internalSetEditMode

    const setCurrentDay = isPreview ? externalSetCurrentDay : internalSetCurrentDay

    // selector: preview ma priorytet dla zewnętrznego
    const selectorSource = isPreview ? externalFilteredEntries : internalFilteredEntries
    const filteredEntriesSelector = resolveFilteredSelector(selectorSource)

    return {
      isPreview,

      posts: safeArray(posts),
      setPosts: safeFn(setPosts),

      selectedPost,
      setSelectedPost: safeFn(setSelectedPost),

      setEditMode: safeFn(setEditMode),

      setCurrentDay: safeFn(setCurrentDay),

      onDayClick: safeFn(onDayClick, () => {}),

      filteredEntriesSelector,
    }
  }, [
    isPreview,

    internalPosts,
    internalSetPosts,
    internalSelectedPost,
    internalSetSelectedPost,
    internalSetEditMode,
    internalFilteredEntries,

    externalPosts,
    externalSetPosts,
    externalSelectedPost,
    externalSetSelectedPost,
    externalSetEditMode,
    externalFilteredEntries,

    internalSetCurrentDay,
    externalSetCurrentDay,

    onDayClick,
  ])
}

export default useBoardRuntime