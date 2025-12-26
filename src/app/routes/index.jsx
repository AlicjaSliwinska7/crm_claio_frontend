// ŁĄCZNIK ROUTÓW — składa wszystkie moduły tras i zwraca gotowe drzewo dla useRoutes()

import React from "react";
import { Navigate } from "react-router-dom";

import MainLayout from "../layout/MainLayout.jsx";
import HomePage from "../pages/HomePage.jsx";
import Login from "../../features/account/pages/Login.jsx";

// Moduły tras (funkcje przyjmujące deps i zwracające tablicę tras)
import { buildSearchRoutes } from "./search.routes.jsx";
import { buildBoardRoutes } from "./board.routes.jsx";
import { buildScheduleRoutes } from "./schedule.routes.jsx";
import { buildEquipmentRoutes } from "./equipment.routes.jsx";
import { buildMethodsRoutes } from "./methods.routes.jsx";
import { buildProfileRoutes } from "./profile.routes.jsx";
import { buildMessagesRoutes } from "./messages.routes.jsx";
import { buildAdminRoutes } from "./administration.routes.jsx";
import { buildTestsRoutes } from "./tests.routes.jsx";
import { buildSalesRoutes } from "./sales.routes.jsx";
import { buildSamplesRoutes } from "./samples.routes.jsx";
import { buildTasksRoutes } from "./tasks.routes.jsx";
import { buildToolsQaRoutes } from "./tools-qa.routes.jsx";
import { buildOperationsRoutes } from "./operations.routes.jsx";
import { buildDocumentationRoutes } from "./documentation.routes.jsx";
import { buildKnowledgeRoutes } from "./knowledge.routes.jsx";
import { buildDevRoutes } from "./dev.routes.jsx";
import buildToolsRoutes from "./tools.routes.jsx"; // ⬅️ default import OK

export function buildAppRoutes(deps) {
  return [
    // Public
    { path: "login", element: <Login /> },

    // Aplikacja pod MainLayout
    {
      path: "/",
      element: <MainLayout clients={deps.clients} />,
      children: [
        { index: true, element: <HomePage /> },

        ...buildSearchRoutes(deps),
        ...buildBoardRoutes(deps),
        ...buildScheduleRoutes(deps),
        ...buildEquipmentRoutes(deps),
        ...buildMethodsRoutes(deps),
        ...buildProfileRoutes(deps),
        ...buildMessagesRoutes(deps),
        ...buildAdminRoutes(deps),
        ...buildTestsRoutes(deps),
        ...buildSalesRoutes(deps),
        ...buildSamplesRoutes(deps),
        ...buildTasksRoutes(deps),
        ...buildToolsQaRoutes(deps),

        // ⬇⬇⬇ DODANE: „Narzędzia” (prawy sidebar) ⬇⬇⬇
        ...buildToolsRoutes(deps),

        ...buildOperationsRoutes(deps),
        ...buildDocumentationRoutes(deps),
        ...buildKnowledgeRoutes(deps),
        ...buildDevRoutes(deps),
      ],
    },

    // Fallback
    { path: "*", element: <Navigate to="/" replace /> },
  ];
}

export default buildAppRoutes;
