// src/features/tests/config/testsSummary.kpi.js

import { FlaskConical, Activity, Timer, Coins } from 'lucide-react'

export const testsKpisMock = [
  {
    id: 'tests-count',
    label: 'Liczba badań',
    value: 128,
    icon: FlaskConical,
  },
  {
    id: 'executions-count',
    label: 'Wykonania',
    value: 342,
    icon: Activity,
  },
  {
    id: 'avg-time',
    label: 'Śr. czas',
    value: '2,6 dni',
    icon: Timer,
  },
  {
    id: 'revenue',
    label: 'Wartość',
    value: '124 800 zł',
    icon: Coins,
  },
]