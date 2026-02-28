// src/features/tests/components/TestsSummary/KPIs.jsx
import React, { memo, useMemo } from 'react'
import PropTypes from 'prop-types'
import {
  BarChart3,
  CheckCircle2,
  XCircle,
  Calculator,
  Clock3,
  CalendarRange,
  Coins,
  Wallet,
} from 'lucide-react'

import {
  SummarySection,
  SummaryCard,
  SummaryHeader,
  SummaryKpiBar,
  SummaryKpiItem,
} from '../../../../shared/summaries'

const fmtNum = (n) => new Intl.NumberFormat('pl-PL').format(Number(n || 0))
const fmt1 = (n) => (n == null ? '—' : Number(n).toFixed(1))

function fmtDatePL(v) {
  if (!v) return '—'
  const d = v instanceof Date ? v : new Date(v)
  if (Number.isNaN(d.getTime())) return '—'
  return new Intl.DateTimeFormat('pl-PL', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(d)
}

function KPIs({ totals, fmtPLN }) {
  const items = useMemo(() => {
    const t = totals || {}

    return [
      {
        key: 'methods',
        icon: <BarChart3 size={18} />,
        label: 'Metody',
        value: fmtNum(t.methods),
        sub: `${fmtNum(t.accCnt)} akr. / ${fmtNum(t.nonAcc)} nieakr.`,
      },
      {
        key: 'tests',
        icon: <Calculator size={18} />,
        label: 'Badań',
        value: fmtNum(t.tests),
        sub: `Próbek: ${fmtNum(t.samples)}`,
      },
      {
        key: 'tat',
        icon: <Clock3 size={18} />,
        label: 'Śr. TAT',
        value: `${fmt1(t.tatWeighted)} dni`,
        sub: t.months ? `Zakres: ${fmtNum(t.months)} mies.` : '—',
      },
      {
        key: 'revenue',
        icon: <Coins size={18} />,
        label: 'Przychód',
        value: fmtPLN ? fmtPLN(t.revenue) : fmtNum(t.revenue),
        sub: `Koszt RH: ${fmtPLN ? fmtPLN(t.labor) : fmtNum(t.labor)}`,
      },
      {
        key: 'margin',
        icon: <Wallet size={18} />,
        label: 'Marża',
        value: fmtPLN ? fmtPLN(t.margin) : fmtNum(t.margin),
        sub: 'Przychód − koszt RH',
      },
      {
        key: 'range',
        icon: <CalendarRange size={18} />,
        label: 'Ostatnie wykonania',
        value: `${fmtDatePL(t.lastFrom)} – ${fmtDatePL(t.lastTo)}`,
        sub: '',
      },
    ]
  }, [totals, fmtPLN])

  return (
    <SummarySection className="es-section">
      <SummaryCard className="es-card">
        <SummaryHeader title="KPI" icon={<BarChart3 className="es-headIcon" aria-hidden="true" />} />

        {/* Zachowujemy klasy z classic theme (tss-card tss-kpis) */}
        <SummaryKpiBar className="tss-card tss-kpis">
          {items.map((it) => (
            <SummaryKpiItem
              key={it.key}
              icon={it.icon}
              label={it.label}
              value={it.value}
              sub={it.sub}
            />
          ))}
        </SummaryKpiBar>
      </SummaryCard>
    </SummarySection>
  )
}

KPIs.propTypes = {
  totals: PropTypes.object,
  fmtPLN: PropTypes.func,
}

export default memo(KPIs)