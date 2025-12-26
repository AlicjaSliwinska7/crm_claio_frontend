import React from "react";
import ProblemsPage from "../../features/qa/pages/ProblemsPage.jsx";
import GeneralProblemsPage from "../../features/qa/pages/GeneralProblemsPage.jsx";

export function buildToolsQaRoutes() {
  return [
    { path: "qa/problemy-app", element: <ProblemsPage /> },
    { path: "qa/problemy", element: <GeneralProblemsPage /> },
  ];
}
