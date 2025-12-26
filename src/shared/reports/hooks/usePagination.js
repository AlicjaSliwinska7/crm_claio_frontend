import { useMemo, useState } from 'react';

export function usePagination({ pageSize = 20, total = 0, initialPage = 1 } = {}) {
  const [page, setPage] = useState(initialPage);
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const canPrev = page > 1;
  const canNext = page < pages;
  const goTo = (p) => setPage(Math.min(Math.max(1, p), pages));
  const next = () => canNext && setPage(p => p + 1);
  const prev = () => canPrev && setPage(p => p - 1);
  const slice = (arr) => {
    const start = (page - 1) * pageSize;
    return arr.slice(start, start + pageSize);
  };
  return { page, pages, pageSize, setPage: goTo, next, prev, canPrev, canNext, slice };
}
