// src/components/pages/contents/TestCard.js
import React from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import '../../lists/styles/List.css'
import { ArrowLeft, Printer } from 'lucide-react'

const fmt = d => (d ? new Date(d).toLocaleDateString('pl-PL') : '—')

/* =============================== DEMO / fallback =============================== */
const DEMO_TESTS = {
  'TEST-091-01': {
    id: 'TEST-091-01',
    orderNo: 'ZLE/2025/091',
    client: 'TechSolutions Sp. z o.o.',
    sample: 'S-0012',
    subject: 'Płyta z tworzywa – rozciąganie',
    standard: 'ISO 527-1:2019',
    method: 'PB-101',
    methodPoint: '5.2.1',
    startDate: '2025-09-05',
    endDate: '2025-09-05',
    status: 'zakończone',
    description:
      'Badanie rozciągania próbki z tworzywa zgodnie z ISO 527-1. Parametry dobrane dla grubości 4 mm.',
    equipment: [
      { id: 'EQ-010', name: 'Maszyna wytrzymałościowa Zwick Z010', model: 'Z010', serial: 'Z010-8745', resolution: '0,1 N', uncertainty: '±0,5%' },
      { id: 'EQ-055', name: 'Extensometer EX-25', model: 'EX-25', serial: 'EX-25-221', resolution: '0,001 mm', uncertainty: '±0,2%' },
    ],
    envRequirements: [
      { name: 'Temperatura', required: '23 ± 2 °C' },
      { name: 'Wilgotność', required: '50 ± 10 %RH' },
    ],
    envMeasured: [
      { name: 'Temperatura', measured: '22,7 °C' },
      { name: 'Wilgotność', measured: '52 %RH' },
    ],
    procedure: {
      requirements: [
        'Próbki kondycjonowane min. 24 h w 23°C/50%RH.',
        'Prędkość głowicy 5 mm/min (ISO 527-1:2019 p. 5.2.1).',
      ],
      steps: ['Montaż próbki, wyzerowanie czujników.', 'Dociążenie wstępne, ustawienie prędkości.', 'Rejestracja siły i odkształcenia do zerwania.'],
    },
    paramChecks: [
      { param: 'Prędkość głowicy', required: '5,0 ± 0,5 mm/min', used: '5,1 mm/min' },
      { param: 'Szerokość próbki', required: '10,0 ± 0,2 mm', used: '10,1 mm' },
      { param: 'Grubość próbki', required: '4,0 ± 0,1 mm', used: '4,0 mm' },
    ],
    measUncertainty: [
      { meas: 'Siła', equipment: 'Zwick Z010', value: '±0,5 % (k=2)' },
      { meas: 'Przemieszczenie', equipment: 'Extensometer EX-25', value: '±0,2 % (k=2)' },
      { meas: 'Wymiary', equipment: 'Suwmiarka 0,01 mm', value: '±0,03 mm (k=2)' },
    ],
    results: [
      { sample: 'S-0012', prop: 'Rm (MPa)', value: 62.4, calc: 'Fmax / (b·t)' },
    ],
    resultUncertainty: [{ prop: 'Rm (MPa)', value: '±2,1 MPa (k=2)' }],
    outcome: 'pozytywny',
  },
  'TEST-094-01': {
    id: 'TEST-094-01',
    orderNo: 'ZLE/2025/094',
    client: 'GreenEnergy S.A.',
    sample: 'S-0042',
    subject: 'EPDM – starzenie, Δmasa/Δtwardość',
    standard: 'EN ISO 13485:2016',
    method: 'PB-330',
    methodPoint: '7.3',
    startDate: '2025-09-10',
    endDate: '2025-09-17',
    status: 'wstrzymane',
    description: 'Starzenie cieplne 7 dni, 70°C; ocena zmian własności.',
    equipment: [{ id: 'EQ-022', name: 'Komora klimatyczna CTS C-40', model: 'C-40', serial: 'CTS-4102', resolution: '0,1 °C', uncertainty: '±0,3 °C' }],
    envRequirements: [{ name: 'Temperatura komory', required: '70 ± 2 °C' }],
    envMeasured: [{ name: 'Temperatura komory', measured: '70,4 °C' }],
    procedure: {
      requirements: ['Próbki w koszykach stalowych, nie dotykają ścian.', 'Stabilizacja komory < 30 min.'],
      steps: ['Załadunek próbek', 'Stabilizacja', 'Ekspozycja 168h', 'Wyładunek i ocena.'],
    },
    paramChecks: [{ param: 'Temp. nastawa', required: '70 ± 2 °C', used: '69,8 °C' }],
    measUncertainty: [{ meas: 'Temperatura', equipment: 'CTS C-40', value: '±0,3 °C (k=2)' }],
    results: [
      { sample: 'S-0042', prop: 'Δmasa (%)', value: 0.2, calc: '(m2-m1)/m1·100%' },
      { sample: 'S-0042', prop: 'Δtwardość Shore A', value: 1, calc: 'A2-A1' },
    ],
    resultUncertainty: [
      { prop: 'Δmasa (%)', value: '±0,05 % (k=2)' },
      { prop: 'Δtwardość', value: '±1 A (k=2)' },
    ],
    outcome: 'nie dotyczy',
  },
  'TEST-097-01': {
    id: 'TEST-097-01',
    orderNo: 'ZLE/2025/097',
    client: 'Meditech Polska',
    sample: 'S-0050',
    subject: 'Aluminium – HRB (3 odciski)',
    standard: 'PN-EN 755',
    method: 'PB-055',
    methodPoint: '4.1',
    startDate: '2025-09-11',
    endDate: '2025-09-11',
    status: 'zakończone',
    description: 'Pomiar HRB na 1 próbce, 3 odciski.',
    equipment: [{ id: 'EQ-031', name: 'Twardościomierz Rockwella HRB-200', model: 'HRB-200', serial: 'HRB-200-77', resolution: '0,5 HRB', uncertainty: '±1 HRB' }],
    envRequirements: [{ name: 'Temperatura', required: '23 ± 5 °C' }],
    envMeasured: [{ name: 'Temperatura', measured: '24,3 °C' }],
    procedure: { requirements: ['Kalibracja bloczkiem HRB 50±1.'], steps: ['Kalibracja', '3 odciski', 'Średnia i odchylenie.'] },
    paramChecks: [{ param: 'Siła nacisku', required: '100 kgf', used: '100 kgf' }],
    measUncertainty: [{ meas: 'HRB', equipment: 'HRB-200', value: '±1 HRB (k=2)' }],
    results: [{ sample: 'S-0050', prop: 'HRB', value: 52.3, calc: 'avg(3 odcisków)' }],
    resultUncertainty: [{ prop: 'HRB', value: '±1 HRB (k=2)' }],
    outcome: 'negatywny',
  },
  'TEST-097-02': {
    id: 'TEST-097-02',
    orderNo: 'ZLE/2025/097',
    client: 'Meditech Polska',
    sample: 'S-0051',
    subject: 'Aluminium – HRB (3 odciski)',
    standard: 'PN-EN 755',
    method: 'PB-055',
    methodPoint: '4.1',
    startDate: '2025-09-11',
    endDate: '2025-09-11',
    status: 'w trakcie',
    description: 'Pomiar HRB – w trakcie.',
    equipment: [{ id: 'EQ-031', name: 'Twardościomierz Rockwella HRB-200', model: 'HRB-200', serial: 'HRB-200-77', resolution: '0,5 HRB', uncertainty: '±1 HRB' }],
    envRequirements: [{ name: 'Temperatura', required: '23 ± 5 °C' }],
    envMeasured: [{ name: 'Temperatura', measured: '—' }],
    procedure: { requirements: ['Kalibracja bloczkiem HRB 50±1.'], steps: ['Kalibracja', '3 odciski', 'Średnia i odchylenie.'] },
    paramChecks: [{ param: 'Siła nacisku', required: '100 kgf', used: '—' }],
    measUncertainty: [{ meas: 'HRB', equipment: 'HRB-200', value: '±1 HRB (k=2)' }],
    results: [],
    resultUncertainty: [{ prop: 'HRB', value: '±1 HRB (k=2)' }],
    outcome: 'nie dotyczy',
  },
  'TEST-103-01': {
    id: 'TEST-103-01',
    orderNo: 'ZLE/2025/103',
    client: 'PlastForm S.C.',
    sample: 'S-0062',
    subject: 'Kompozyt – zginanie trójpunktowe',
    standard: 'PN-EN 1234:2020',
    method: 'PB-998',
    methodPoint: 'A',
    startDate: '2025-09-20',
    endDate: '2025-09-25',
    status: 'czeka na rozpoczęcie',
    description: 'Zaplanowane badanie zginania 3P.',
    equipment: [],
    envRequirements: [],
    envMeasured: [],
    procedure: { requirements: [], steps: [] },
    paramChecks: [],
    measUncertainty: [],
    results: [],
    resultUncertainty: [],
    outcome: 'nie dotyczy',
  },
}

/* =============================== Komponent =============================== */
export default function TestCard({ test: testProp }) {
  const { testId } = useParams()
  const navigate = useNavigate()

  const test = testProp || DEMO_TESTS[testId]

  if (!test) {
    return (
      <div className="table-container" style={{ padding: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <h3 style={{ margin: 0 }}>Test card: {testId}</h3>
          <button className="pagination-btn" onClick={() => navigate(-1)}>
            <ArrowLeft size={16} style={{ marginRight: 6 }} /> Back
          </button>
        </div>
        <p>Brak danych dla wskazanego badania.</p>
      </div>
    )
  }

  return (
    <div className="tests-list">
      <div className="table-container" style={{ padding: 16, borderRadius: 12 }}>
        {/* Nagłówek + akcje */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <div>
            <h2 style={{ margin: 0 }}>Test card — {test.id}</h2>
            <div className="muted" style={{ marginTop: 4 }}>
              Order:{' '}
              {test.orderNo ? (
                <Link to={`/sprzedaz/rejestr-zlecen?order=${encodeURIComponent(test.orderNo)}`}>
                  <strong>{test.orderNo}</strong>
                </Link>
              ) : (
                <strong>—</strong>
              )}
              {' · '} Client:{' '}
              {test.client ? (
                <Link to={`/sprzedaz/klienci/${encodeURIComponent(test.client)}`}>
                  <strong>{test.client}</strong>
                </Link>
              ) : (
                <strong>—</strong>
              )}
              {' · '} Sample:{' '}
              {test.sample ? (
                <Link to={`/probki/rejestr-probek?sample=${encodeURIComponent(test.sample)}`}>
                  <strong>{test.sample}</strong>
                </Link>
              ) : (
                <strong>—</strong>
              )}
              {' · '} Status: <strong>{test.status || '—'}</strong>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {test.orderNo && (
              <Link className="pagination-btn" to={`/badania/program/${encodeURIComponent(test.orderNo)}`} title="Back to Test Program">
                <ArrowLeft size={16} style={{ marginRight: 6 }} /> Back
              </Link>
            )}
            <button className="pagination-btn" onClick={() => window.print()} title="Print / Save as PDF">
              <Printer size={16} style={{ marginRight: 6 }} /> Print
            </button>
          </div>
        </div>

        {/* Meta */}
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 12, marginBottom: 12 }}>
          <div className="card-like">
            <div className="muted">Subject</div>
            <div>{test.subject || '—'}</div>
          </div>
          <div className="card-like">
            <div className="muted">Standard / Document</div>
            <div>
              {test.standard ? (
                <Link to={`/dokumentacja/normy?norma=${encodeURIComponent(test.standard)}`}>{test.standard}</Link>
              ) : (
                '—'
              )}
            </div>
          </div>
          <div className="card-like">
            <div className="muted">Method</div>
            <div>
              {test.method ? (
                <Link to={`/dokumentacja/metody?code=${encodeURIComponent(test.method)}`}>{test.method}</Link>
              ) : (
                '—'
              )}
              {test.methodPoint ? `, p. ${test.methodPoint}` : ''}
            </div>
          </div>
          <div className="card-like">
            <div className="muted">Start → End</div>
            <div>{fmt(test.startDate)} → {fmt(test.endDate)}</div>
          </div>
          <div className="card-like">
            <div className="muted">Outcome</div>
            <div><strong>{test.outcome || '—'}</strong></div>
          </div>
        </section>

        {/* Opis */}
        <section style={{ marginBottom: 12 }}>
          <strong>Description</strong>
          <div style={{ marginTop: 6 }}>{test.description || '—'}</div>
        </section>

        {/* Sprzęt */}
        <section style={{ marginBottom: 12 }}>
          <strong>Equipment</strong>
          <div className="table-container" style={{ marginTop: 6 }}>
            {Array.isArray(test.equipment) && test.equipment.length > 0 ? (
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Model</th>
                    <th>Serial</th>
                    <th>Resolution</th>
                    <th>Uncertainty</th>
                  </tr>
                </thead>
                <tbody>
                  {test.equipment.map((e, i) => (
                    <tr key={i}>
                      <td>{e.id || '—'}</td>
                      <td>{e.name || '—'}</td>
                      <td>{e.model || '—'}</td>
                      <td>{e.serial || '—'}</td>
                      <td>{e.resolution || '—'}</td>
                      <td>{e.uncertainty || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={{ padding: 8 }}>—</div>
            )}
          </div>
        </section>

        {/* Warunki środowiskowe */}
        <section style={{ marginBottom: 12 }}>
          <strong>Environmental conditions</strong>
          <div className="table-container" style={{ marginTop: 6 }}>
            <table>
              <thead>
                <tr>
                  <th>Quantity</th>
                  <th>Required</th>
                  <th>Measured</th>
                </tr>
              </thead>
              <tbody>
                {(test.envRequirements || []).length > 0 ? (
                  (test.envRequirements || []).map((r, i) => {
                    const m = (test.envMeasured || []).find(x => x.name === r.name)
                    return (
                      <tr key={i}>
                        <td>{r.name}</td>
                        <td>{r.required}</td>
                        <td>{m?.measured || '—'}</td>
                      </tr>
                    )
                  })
                ) : (
                  <tr><td colSpan={3}>—</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Parametry badania */}
        <section style={{ marginBottom: 12 }}>
          <strong>Test parameters</strong>
          <div className="table-container" style={{ marginTop: 6 }}>
            {Array.isArray(test.paramChecks) && test.paramChecks.length > 0 ? (
              <table>
                <thead>
                  <tr>
                    <th>Parameter</th>
                    <th>Required</th>
                    <th>Used</th>
                  </tr>
                </thead>
                <tbody>
                  {test.paramChecks.map((p, i) => (
                    <tr key={i}>
                      <td>{p.param}</td>
                      <td>{p.required}</td>
                      <td>{p.used}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={{ padding: 8 }}>—</div>
            )}
          </div>
        </section>

        {/* Niepewności (sprzęt) */}
        <section style={{ marginBottom: 12 }}>
          <strong>Measurement uncertainties (equipment)</strong>
          <div className="table-container" style={{ marginTop: 6 }}>
            {Array.isArray(test.measUncertainty) && test.measUncertainty.length > 0 ? (
              <table>
                <thead>
                  <tr>
                    <th>Quantity</th>
                    <th>Equipment</th>
                    <th>Uncertainty</th>
                  </tr>
                </thead>
                <tbody>
                  {test.measUncertainty.map((u, i) => (
                    <tr key={i}>
                      <td>{u.meas}</td>
                      <td>{u.equipment}</td>
                      <td>{u.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={{ padding: 8 }}>—</div>
            )}
          </div>
        </section>

        {/* Wyniki */}
        <section>
          <strong>Results & calculations</strong>
          <div className="table-container" style={{ marginTop: 6 }}>
            {Array.isArray(test.results) && test.results.length > 0 ? (
              <table>
                <thead>
                  <tr>
                    <th>Sample</th>
                    <th>Property</th>
                    <th>Value</th>
                    <th>Calculation</th>
                  </tr>
                </thead>
                <tbody>
                  {test.results.map((r, i) => (
                    <tr key={i}>
                      <td>
                        {r.sample && r.sample !== '—' ? (
                          <Link to={`/probki/rejestr-probek?sample=${encodeURIComponent(r.sample)}`}>{r.sample}</Link>
                        ) : (
                          r.sample || '—'
                        )}
                      </td>
                      <td>{r.prop}</td>
                      <td>{String(r.value)}</td>
                      <td>{r.calc || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={{ padding: 8 }}>—</div>
            )}
          </div>
          {Array.isArray(test.resultUncertainty) && test.resultUncertainty.length > 0 && (
            <div className="table-container" style={{ marginTop: 8 }}>
              <table>
                <thead>
                  <tr>
                    <th>Property</th>
                    <th>Uc</th>
                  </tr>
                </thead>
                <tbody>
                  {test.resultUncertainty.map((u, i) => (
                    <tr key={i}>
                      <td>{u.prop}</td>
                      <td>{u.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
