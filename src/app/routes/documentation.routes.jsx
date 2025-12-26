import React from "react";
import { Navigate } from "react-router-dom";
import DocumentationOrdersPage from "../../features/documentation/pages/DocumentationOrdersPage.jsx";
import OrderDetails from "../../features/documentation/pages/OrderDetails.jsx";
import PPPsList from "../../features/documentation/pages/PPPsList.jsx";
import PPP from "../../features/documentation/pages/PPP.jsx";
import PBList from "../../features/documentation/pages/PBList.jsx";
import PB from "../../features/documentation/pages/PB.jsx";
import KBList from "../../features/documentation/pages/KbList.jsx";
import KB from "../../features/documentation/pages/KB.jsx";
import CalcCardsList from "../../features/documentation/pages/CalcCardsList.jsx";
import CalcCard from "../../features/documentation/pages/CalcCard.jsx";
import LogsList from "../../features/documentation/pages/LogsList.jsx";
import LogsDetail from "../../features/documentation/pages/LogsDetail.jsx";
import OtherInfoList from "../../features/documentation/pages/OtherInfoList.jsx";
import OtherInfoDetail from "../../features/documentation/pages/OtherInfoDetail.jsx";
import ReportsList from "../../features/documentation/pages/ReportsList.jsx";
import Report from "../../features/documentation/pages/Report.jsx";
import ArchiveList from "../../features/documentation/pages/ArchiveList.jsx";
import Archive from "../../features/documentation/pages/Archive.jsx";
import Offer from "../../features/documentation/pages/Offer.js";

export function buildDocumentationRoutes(deps) {
  const { offers, clients } = deps;
  return [
    {
      path: "dokumentacja",
      children: [
        { index: true, element: <Navigate to="zlecenia" replace /> },
        { path: "zlecenia", element: <DocumentationOrdersPage /> },
        { path: "zlecenia/:id", element: <OrderDetails mode="docs" /> },

        // PPP
        { path: "ppp", element: <PPPsList /> },
        { path: "ppp/:id", element: <PPP /> },
        { path: "zlecenia/:id/przyjecie-probek", element: <PPP /> },

        // PB
        { path: "pb", element: <PBList /> },
        { path: "pb/:id", element: <PB /> },

        // Oferty (re-use komponentu Offer)
        { path: "oferty/:id", element: <Offer offers={offers} clients={clients} /> },

        // KB / karty kalkulacyjne
        { path: "karty-badan", element: <KBList /> },
        { path: "karty-badan/nowa", element: <KB /> },
        { path: "karty-badan/:id", element: <KB /> },
        { path: "karty-kalkulacyjne", element: <CalcCardsList /> },
        { path: "karty-kalkulacyjne/:id", element: <CalcCard /> },

        // Logi / inne informacje / sprawozdania
        { path: "logi", element: <LogsList /> },
        { path: "logi/:id", element: <LogsDetail /> },
        { path: "inne-informacje", element: <OtherInfoList /> },
        { path: "inne-informacje/:id", element: <OtherInfoDetail /> },
        { path: "sprawozdania", element: <ReportsList /> },
        { path: "sprawozdania/:id", element: <Report /> },

        // Archiwizacja
        { path: "archiwizacja", element: <ArchiveList /> },
        { path: "archiwizacja/:id", element: <Archive /> },
      ],
    },
  ];
}
