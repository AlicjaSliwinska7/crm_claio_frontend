import React from "react";
import { Navigate } from "react-router-dom";
import TestsSummary from "../../features/tests/pages/TestsSummary.jsx";
import TestsSchedule from "../../features/tests/pages/TestsSchedule.jsx";
import TestsRegistry from "../../features/tests/pages/TestsRegister.jsx";

export function buildTestsRoutes() {
  return [
    {
      path: "badania",
      children: [
        { index: true, element: <Navigate to="zestawienie" replace /> },
        { path: "zestawienie", element: <TestsSummary /> },
        { path: "harmonogram", element: <TestsSchedule /> },
        { path: "rejestr-badan", element: <TestsRegistry /> },
      ],
    },
  ];
}
