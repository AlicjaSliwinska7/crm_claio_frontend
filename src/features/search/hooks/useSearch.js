import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { searchAll } from "../api/search.api";

function useDebounce(value, delay = 300) {
  const [v, setV] = useState(value);
  useEffect(() => { const id = setTimeout(() => setV(value), delay); return () => clearTimeout(id); }, [value, delay]);
  return v;
}

export function useSearch() {
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const rawQuery = (params.get("q") || "").trim();

  const [filters, setFilters] = useState({
    types: new Set(), // np. "client","offer","sample"
    status: new Set(),
  });
  const [sort, setSort] = useState({ by: "relevance", dir: "desc" });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const debouncedQuery = useDebounce(rawQuery, 250);
  const [rawResults, setRawResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    searchAll({ q: debouncedQuery })
      .then((data) => { if (alive) setRawResults(data || []); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [debouncedQuery]);

  const filtered = useMemo(() => {
    let items = rawResults;
    if (filters.types.size) items = items.filter(it => filters.types.has(it.type));
    if (filters.status.size) items = items.filter(it => it.status && filters.status.has(it.status));
    return items;
  }, [rawResults, filters]);

  const sorted = useMemo(() => {
    const copy = [...filtered];
    const dir = sort.dir === "asc" ? 1 : -1;
    switch (sort.by) {
      case "date":  copy.sort((a, b) => (new Date(a.date||0) - new Date(b.date||0)) * dir); break;
      case "title": copy.sort((a, b) => (a.title||"").localeCompare(b.title||"") * dir); break;
      default:      copy.sort((a, b) => ((b.score ?? 0) - (a.score ?? 0)) * (sort.dir === "asc" ? -1 : 1)); // relevance
    }
    return copy;
  }, [filtered, sort]);

  const total = sorted.length;
  const start = (page - 1) * pageSize;
  const pageItems = sorted.slice(start, start + pageSize);

  useEffect(() => { setPage(1); },
    [debouncedQuery, pageSize, JSON.stringify([...filters.types]), JSON.stringify([...filters.status])]
  );

  return {
    query: debouncedQuery,
    results: pageItems,
    total,
    loading,
    filters, setFilters,
    sort, setSort,
    page, setPage,
    pageSize, setPageSize,
  };
}
