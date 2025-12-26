import React from "react";
import OperationsHub from "../../features/operations/pages/OperationsHub.jsx";
import OrdersToRegister from "../../features/operations/pages/OrdersToRegister.jsx";
import WaitingForDelivery from "../../features/operations/pages/WaitingForDelivery.jsx";
import SamplesToAccept from "../../features/operations/pages/SamplesToAccept.jsx";
import PBToPrepare from "../../features/operations/pages/PBToPrepare.jsx";
import TestsToExecute from "../../features/operations/pages/TestsToExecute.jsx";
import LogsToPrepare from "../../features/operations/pages/LogsToPrepare.jsx";
import KBToPrepare from "../../features/operations/pages/KBToPrepare.jsx";
import ReportsToPrepare from "../../features/operations/pages/ReportsToPrepare.jsx";
import DocsToArchive from "../../features/operations/pages/DocsToArchive.jsx";

export function buildOperationsRoutes() {
  return [
    {
      path: "operacje",
      children: [
        { index: true, element: <OperationsHub /> },
        { path: "zlecenia-do-zarejestrowania", element: <OrdersToRegister /> },
        { path: "oczekiwanie-na-dostawe", element: <WaitingForDelivery /> },
        { path: "probki-do-przyjecia", element: <SamplesToAccept /> },
        { path: "pb-do-przygotowania", element: <PBToPrepare /> },
        { path: "badania-do-wykonania", element: <TestsToExecute /> },
        { path: "logi-do-przygotowania", element: <LogsToPrepare /> },
        { path: "kb-do-przygotowania", element: <KBToPrepare /> },
        { path: "sprawozdania-do-przygotowania", element: <ReportsToPrepare /> },
        { path: "dokumentacja-do-archiwizacji", element: <DocsToArchive /> },
      ],
    },
  ];
}
