import React from 'react'
import { Pin, XCircle } from 'lucide-react'
import BoardFilters from './BoardFilters'

/**
 * Defensywny wrapper nagłówka – zapewnia domyślne wartości i listy.
 * Układ: pinezka -> filtry -> czyszczenie (w jednej linii, wspólny gap)
 */
export default function BoardPreviewHeader({
  filterType = 'all',
  setFilterType = () => {},
  filterAuthor = '',
  setFilterAuthor = () => {},
  filterMentioned = '',
  setFilterMentioned = () => {},
  filterPriority = '',
  setFilterPriority = () => {},
  filterTag = '',
  setFilterTag = () => {},
  onOpenCreate = () => {},
  onReset = () => {},
  authors = [],
  users = [],
  tags = [],
}) {
  const safeAuthors = Array.isArray(authors) ? authors : []
  const safeUsers = Array.isArray(users) ? users : []
  const safeTags = Array.isArray(tags) ? tags : []

  return (
    <header className="board-preview-header">
      <div className="preview-filters-row">
        <div className="preview-actions">
          <button className="pin-button" onClick={onOpenCreate} title="Przypnij nowy wpis">
            <Pin size={22} />
          </button>
        </div>

        <BoardFilters
          filterType={filterType}
          setFilterType={setFilterType}
          filterAuthor={filterAuthor}
          setFilterAuthor={setFilterAuthor}
          filterMentioned={filterMentioned}
          setFilterMentioned={setFilterMentioned}
          filterPriority={filterPriority}
          setFilterPriority={setFilterPriority}
          filterTag={filterTag}
          setFilterTag={setFilterTag}
          authors={safeAuthors}
          users={safeUsers}
          tags={safeTags}
        />

        <button onClick={onReset} title="Wyczyść filtry" className="preview-reset-button">
          <XCircle size={20} />
        </button>
      </div>
    </header>
  )
}