import React from "react";
const SearchPage = React.lazy(() => import("../../features/search/pages/SearchPage.jsx"));

export function buildSearchRoutes() {
  return [
    {
      path: "szukaj",
      element: (
        <React.Suspense fallback={<div style={{ padding: 16 }}>Ładowanie…</div>}>
          <SearchPage />
        </React.Suspense>
      ),
    },
  ];
}
