import React, { useMemo, useState } from 'react'
import '../styles/pricing-builder.css'

import {
  ClientPicker,
  PositionsTable,
  PriceCatalog,          // teraz będzie w prawym sidebarze (w wersji kompaktowej)
  ClientHistoryPanel,
  SummaryPanel,
  sum,
} from '../components/PricingBuilder'

import { PRICING_CFG, calcLineNet, matchLoyaltyTier } from '../components/PricingBuilder/pricing'

// ===== Demo fallback =====
const DEMO_METHODS = [
  {
    id: 'M-001',
    methodNo: 'PB-101',
    name: 'Rozciąganie tworzyw sztucznych',
    subject: 'Tworzywa',
    pricing: {
      baseFirst: 400,
      baseNext: 160,
      minChargeSamples: 1,
      accreditedExtraPct: 0.1,
      urgentPct: 0.15,
      sampleTypeExtras: { standard: 0, wielkogabarytowy: 0.1, niebezpieczny: 0.15 },
    },
    accredited: true,
  },
  {
    id: 'M-002',
    methodNo: 'PB-998',
    name: 'Odporność na zginanie (A)',
    subject: 'Metale',
    pricing: {
      baseFirst: 520,
      baseNext: 220,
      minChargeSamples: 2,
      accreditedExtraPct: 0.12,
      urgentPct: 0.2,
      sampleTypeExtras: { standard: 0, wielkogabarytowy: 0.08, niebezpieczny: 0.15 },
    },
    accredited: true,
  },
  {
    id: 'M-003',
    methodNo: 'IN-12',
    name: 'Badanie wizualne elementów',
    subject: 'Różne',
    pricing: {
      baseFirst: 180,
      baseNext: 80,
      minChargeSamples: 1,
      accreditedExtraPct: 0,
      urgentPct: 0.1,
      sampleTypeExtras: { standard: 0, wielkogabarytowy: 0.05, niebezpieczny: 0.1 },
    },
    accredited: false,
  },
]

const DEMO_CLIENTS = [
  { id: 'C-001', name: 'TechSolutions Sp. z o.o.', totalTests: 18 },
  { id: 'C-002', name: 'GreenEnergy S.A.', totalTests: 42 },
  { id: 'C-003', name: 'Meditech Polska', totalTests: 7 },
]

const DEMO_HISTORY = [
  { clientId: 'C-001', date: '2025-05-10', methodId: 'M-001', samples: 6, accredited: true },
  { clientId: 'C-001', date: '2025-06-02', methodId: 'M-003', samples: 12, accredited: false },
  { clientId: 'C-001', date: '2025-08-15', methodId: 'M-002', samples: 4, accredited: true },
  { clientId: 'C-002', date: '2025-04-22', methodId: 'M-001', samples: 10, accredited: true },
  { clientId: 'C-002', date: '2025-07-03', methodId: 'M-002', samples: 16, accredited: true },
  { clientId: 'C-003', date: '2025-06-27', methodId: 'M-003', samples: 7, accredited: false },
]

// ===== helpers =====
let seq = 1
const newLine = (methods) => {
  const m = methods?.[0]
  return {
    id: `L-${seq++}`,
    methodId: m?.id || '',
    samples: 1,
    accredited: !!m?.accredited,
    urgent: false,
    sampleType: 'standard',
    note: '',
  }
}

export default function PricingBuilder({
  methods = DEMO_METHODS,
  clients = DEMO_CLIENTS,
  history = DEMO_HISTORY,
}) {
  // ── stan
  const [clientId, setClientId] = useState(clients[0]?.id || '')
  const [lineItems, setLineItems] = useState([newLine(methods)])
  const [defaultVat] = useState(PRICING_CFG.vatPct)
  const [overrideOn, setOverrideOn] = useState(false)
  const [overrideNet, setOverrideNet] = useState('')

  // ── pochodne
  const client = useMemo(() => clients.find((c) => c.id === clientId) || null, [clients, clientId])

  const methodById = useMemo(() => {
    const m = new Map()
    methods.forEach((x) => m.set(x.id, x))
    return m
  }, [methods])

  const clientHistory = useMemo(() => {
    if (!client) return { totals: { tests: 0, samples: 0, acc: 0 }, rows: [] }
    const rows = history
      .filter((h) => h.clientId === client.id)
      .map((h) => {
        const m = methodById.get(h.methodId)
        return {
          date: h.date,
          methodNo: m?.methodNo || h.methodId,
          name: m?.name || '',
          samples: Number(h.samples || 0),
          accredited: !!h.accredited,
        }
      })
      .sort((a, b) => String(b.date).localeCompare(String(a.date)))

    const totals = rows.reduce(
      (acc, r) => {
        acc.tests += 1
        acc.samples += r.samples || 0
        acc.acc += r.accredited ? 1 : 0
        return acc
      },
      { tests: 0, samples: 0, acc: 0 }
    )
    return { totals, rows }
  }, [client, history, methodById])

  const loyaltyBaseTests = useMemo(
    () => Math.max(client?.totalTests ?? 0, clientHistory?.totals?.tests ?? 0),
    [client, clientHistory]
  )
  const { match: loyaltyTier } = useMemo(
    () => matchLoyaltyTier(loyaltyBaseTests, PRICING_CFG.loyalty),
    [loyaltyBaseTests]
  )

  const totals = useMemo(() => {
    const lines = lineItems.map((li) => {
      const m = methodById.get(li.methodId)
      const calc = calcLineNet(m, li)
      return { ...li, method: m, net: calc.net, base: calc.base, chargeSamples: calc.chargeSamples, parts: calc.parts }
    })

    const subNet = sum(lines.map((l) => l.net))
    const loyalPct = loyaltyTier.pct || 0
    const loyalVal = subNet * loyalPct
    const afterLoyal = subNet - loyalVal

    const baseNet = overrideOn ? Number(overrideNet || 0) : afterLoyal
    const vatVal = baseNet * defaultVat
    const grand = baseNet + vatVal

    return { lines, subNet, loyalPct, loyalVal, afterLoyal, vatVal, grand }
  }, [lineItems, methodById, defaultVat, overrideOn, overrideNet, loyaltyTier])

  // ── handlery
  const updateLine = (id, patch) => setLineItems((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)))
  const addLine = () => setLineItems((prev) => [...prev, newLine(methods)])
  const removeLine = (id) => setLineItems((prev) => prev.filter((l) => l.id !== id))
  const pickMethodToLines = (methodId) => setLineItems((prev) => [...prev, { ...newLine(methods), methodId }])

  const exportCsv = () => {
    const q = (v) => `"${String(v ?? '').replaceAll('"', '""')}"`
    const header = ['Metoda', 'Nazwa', 'Próbek', 'Naliczane szt.', 'Akredytacja', 'Pilne', 'Typ', 'Netto [PLN]']
      .map(q)
      .join(';')
    const body = totals.lines.map((l) =>
      [l.method?.methodNo || l.methodId, l.method?.name || '', l.samples, l.chargeSamples, l.accredited ? 'TAK' : 'NIE', l.urgent ? 'TAK' : 'NIE', l.sampleType, Math.round(l.net)]
        .map(q)
        .join(';')
    )
    const sumLine = q('Suma netto') + ';' + ';'.repeat(6) + q(Math.round(totals.subNet))
    const loyalLine = q('Rabat lojalnościowy') + ';' + ';'.repeat(6) + q(`-${Math.round(totals.loyalPct * 100)}% (${Math.round(totals.loyalVal)} PLN)`)
    const afterLoyalLine = q('Po rabacie') + ';' + ';'.repeat(6) + q(Math.round(totals.afterLoyal))
    const vatLine = q('VAT') + ';' + ';'.repeat(6) + q(Math.round(totals.vatVal))
    const grandLine = q('Brutto') + ';' + ';'.repeat(6) + q(Math.round(totals.grand))
    const csv = [header, ...body, sumLine, loyalLine, afterLoyalLine, vatLine, grandLine].join('\r\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `wycena_${client?.name || 'klient'}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const saveOffer = () => alert('Zapis oferty: TODO (podłącz backend lub generator pliku).')

  // ── UI: lewa szeroko, prawa wąski sidebar z podsumowaniem + cennikiem
  return (
    <main className="pricing pricing--catalog-in-aside">
      {/* Główny header + szybkie akcje */}
      <header className="card" style={{ paddingBottom: 10 }}>
        <div className="card-head">
          <div>
            <h3 className="card__h3" style={{ marginBottom: 2 }}>Sprzedaż — wycena</h3>
            <span className="small muted">Pozycje, historia i podsumowanie; cennik po prawej</span>
          </div>
          <div className="row" style={{ alignItems: 'center' }}>
            <button className="btn btn--export" onClick={exportCsv}>Eksportuj CSV</button>
            <button className="btn primary" onClick={saveOffer}>Zapisz ofertę</button>
          </div>
        </div>
      </header>

      {/* Lewa kolumna — pełna szerokość działania */}
      <section className="pricing__left">
        <div className="stack">
          <section id="sek-klient" className="card">
            <div className="card-head">
              <h3 className="card__h3">Klient</h3>
              <span className="small muted">wybór oraz licznik lojalności</span>
            </div>
            <ClientPicker
              clients={clients}
              clientId={clientId}
              onChange={setClientId}
              loyaltyBaseTests={loyaltyBaseTests}
            />
          </section>

          <section id="sek-wycena" className="card">
            <div className="card-head">
              <h3 className="card__h3">Pozycje</h3>
              <div className="row"><button className="btn" onClick={addLine}>+ Dodaj pozycję</button></div>
            </div>
            <PositionsTable
              lines={totals.lines}
              methods={methods}
              pricingSampleTypes={PRICING_CFG.sampleTypes}
              onAdd={addLine}
              onUpdateLine={updateLine}
              onRemoveLine={removeLine}
            />
          </section>

          <section id="sek-historia" className="card">
            <div className="card-head">
              <h3 className="card__h3">Historia klienta</h3>
              <span className="small muted">{client?.name || '—'}</span>
            </div>
            <ClientHistoryPanel clientName={client?.name} clientHistory={clientHistory} />
          </section>
        </div>
      </section>

      {/* Prawy sidebar — PODSUMOWANIE (sticky) + CENNIK (kompakt) */}
      <aside className="pricing__right">
        <div className="sticky-wrap">
          <div className="aside-block">
            <SummaryPanel
              totals={totals}
              defaultVat={defaultVat}
              loyaltyTier={loyaltyTier}
              loyaltyBaseTests={loyaltyBaseTests}
              overrideOn={overrideOn}
              overrideNet={overrideNet}
              setOverrideOn={setOverrideOn}
              setOverrideNet={setOverrideNet}
              onExportCsv={exportCsv}
              onSaveOffer={saveOffer}
            />
          </div>

          <div className="aside-block">
            {/* kompaktowy cennik jawny w sidebarze */}
            <div className="card">
              <div className="card-head">
                <h3 className="card__h3">Cennik jawny</h3>
                <span className="small muted">kliknij aby dodać</span>
              </div>
              <PriceCatalog
                methods={methods}
                onPickMethod={pickMethodToLines}
                variant="aside"              // ← (opcjonalny prop dla komponentu, jeżeli obsłużysz)
              />
            </div>
          </div>
        </div>
      </aside>
    </main>
  )
}
