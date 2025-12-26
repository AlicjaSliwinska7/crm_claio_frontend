import React from "react";
import KnowledgeBasePage from "../../features/knowledge/pages/KnowledgeBasePage"

export function buildKnowledgeRoutes() {
  return [{ path: "baza-wiedzy", element: <KnowledgeBasePage /> }];
}
