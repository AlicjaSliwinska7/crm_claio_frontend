// src/features/board/config/boardPreviewTable.config.js

/* =========================================================
   BoardPreview – Table config (SSOT)
   - Tylko tabela: kolumny, sortowanie, paginacja
   - Używane przez: src/features/board/components/BoardPreview/Table.jsx
   ========================================================= */

export const BOARD_PREVIEW_TABLE = {
  pageSize: 10,

  defaultSort: { key: 'createdAt', direction: 'desc' },

  // mapowanie sortKey -> reguły sortRows (shared/tables)
  sortOptions: {
    createdAt: { type: 'date', accessor: (r) => r?.createdAt || null },
    dayText: { type: 'text', accessor: (r) => r?.dayText || '' },
    title: { type: 'text', accessor: (r) => r?.title || '' },
    author: { type: 'text', accessor: (r) => r?.author || '' },
    type: { type: 'text', accessor: (r) => r?.type || '' },
    priority: { type: 'text', accessor: (r) => r?.priority || '' },
    tagsText: { type: 'text', accessor: (r) => r?.tagsText || '' },
  },

  // kolumny pod DataTableWithActions (shared/tables)
  // Uwaga: nazwy pól zgodne z adaptBoardRows + tagsText dopinane w Table.jsx
  columns: [
    {
      key: 'dayText',
      header: 'Data',
      width: 140,
      align: 'center',
      sortable: true,
      sortKey: 'dayText',
      render: (val) => val || '—',
    },
    {
      key: 'title',
      header: 'Tytuł',
      minWidth: 260,
      sortable: true,
      sortKey: 'title',
      render: (val) => val || '—',
    },
    {
      key: 'author',
      header: 'Autor',
      minWidth: 180,
      sortable: true,
      sortKey: 'author',
      render: (val) => val || '—',
    },
    {
      key: 'type',
      header: 'Typ',
      width: 130,
      align: 'center',
      sortable: true,
      sortKey: 'type',
      render: (val) => (
        <span className={`type-chip ${val === 'task' ? 'type-task' : 'type-post'}`}>
          {val === 'task' ? 'Zadanie' : 'Post'}
        </span>
      ),
    },
    {
      key: 'priority',
      header: 'Priorytet',
      width: 150,
      align: 'center',
      sortable: true,
      sortKey: 'priority',
      render: (val) => {
        const cls =
          val === 'wysoki'
            ? 'priority-wysoki'
            : val === 'normalny'
              ? 'priority-normalny'
              : val === 'niski'
                ? 'priority-niski'
                : 'priority-blank'

        return <span className={`priority-chip ${cls}`}>{val || '—'}</span>
      },
    },
    {
      key: 'tags',
      header: 'Tagi',
      minWidth: 220,
      sortable: true,
      sortKey: 'tagsText',
      render: (_, row) => {
        const tags = Array.isArray(row?.tags) ? row.tags : []
        if (!tags.length) return '—'
        return (
          <span className="tags">
            {tags.map((t) => (
              <span key={t} className="tag-chip">
                {t}
              </span>
            ))}
          </span>
        )
      },
    },
  ],
}