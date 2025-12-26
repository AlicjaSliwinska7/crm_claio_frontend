import React from "react";
import { Navigate } from "react-router-dom";
import SamplesRegister from "../../features/samples/pages/SamplesRegister.jsx";
import Sample from "../../features/samples/pages/Sample.jsx";
import SamplesDeliveryPickup from "../../features/samples/pages/SamplesDeliveryPickupRegister.jsx";
import SamplesDisposal from "../../features/samples/pages/SamplesDisposalRegister.jsx";
import SamplesSummary from "../../features/samples/pages/SamplesSummary.jsx";

export function buildSamplesRoutes(deps) {
  const { samples, setSamples } = deps;
  return [
    {
      path: "probki",
      children: [
        { index: true, element: <Navigate to="rejestr-probek" replace /> },
        { path: "rejestr-probek", element: <SamplesRegister samples={samples} setSamples={setSamples} /> },
        { path: "rejestr-probek/:id", element: <Sample samples={samples} /> },
        { path: "dostawa-i-odbior", element: <SamplesDeliveryPickup /> },
        { path: "utylizacja", element: <SamplesDisposal /> },
        { path: "zestawienie", element: <SamplesSummary samples={samples} /> },
      ],
    },
  ];
}
