import React from 'react'

export default function PriceLegend() {
  return (
    <div className="legend">
      <div className="legend__block">
        <div className="legend__h">Oznaczenia</div>
        <ul className="legend__list">
          <li><span className="pill pill--akr">akred.</span> – metoda w akredytacji</li>
          <li><span className="pill">pilne +X%</span> – dopłata za tryb pilny</li>
          <li><span className="pill weak">Tematyka</span> – grupa metody</li>
        </ul>
      </div>

      <div className="legend__block">
        <div className="legend__h">Wskazówki</div>
        <ul className="legend__list">
          <li>Możesz dodać wiele metod — każda staje się osobną pozycją.</li>
          <li>Rabat lojalnościowy nalicza się automatycznie w podsumowaniu.</li>
          <li>„Min. naliczanie” to minimalna liczba próbek liczona do ceny.</li>
        </ul>
      </div>
    </div>
  )
}
