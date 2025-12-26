import React from "react";
import { Navigate } from "react-router-dom";
import TestingMethodsList from "../../features/methods/pages/TestingMethodsDirectory.jsx";
import TestingMethodDetails from "../../features/methods/pages/TestingMethodDetails.js";

export function buildMethodsRoutes() {
  return [
    {
      path: "metody-badawcze",
      children: [
        { index: true, element: <Navigate to="spis" replace /> },
        { path: "spis", element: <TestingMethodsList /> },
        { path: "spis/:methodNo", element: <TestingMethodDetails /> },
      ],
    },
  ];
}
