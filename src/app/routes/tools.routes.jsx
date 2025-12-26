// src/app/routes/tools.routes.jsx
import React from "react"

// DOPASUJ import do nazwy/pliku Twojej strony z wykresami.
// Najczęściej po refaktorze ląduje tu:
import ChartsLab from "../../features/tools/pages/ChartsLab.jsx"
// Jeśli u Ciebie plik nazywa się inaczej (np. Charts.jsx), zmień import.

export default function buildToolsRoutes() {
  return [
    {
      path: "narzedzia",
      children: [
        { index: true, element: <ChartsLab /> },     // /narzedzia
        { path: "wykresy", element: <ChartsLab /> }, // /narzedzia/wykresy (alias)
      ],
    },
  ]
}
