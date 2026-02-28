// src/features/tests/mocks/testsSummary.mock.js
export const DEMO_METHODS = [
  { id: 'm1', standard: 'PN-EN 123', methodNo: 'M-01', methodName: 'Badanie A', accredited: true },
  { id: 'm2', standard: 'PN-EN 456', methodNo: 'M-02', methodName: 'Badanie B', accredited: false },
]

export const DEMO_EXECUTIONS = [
  { id: 'e1', methodId: 'm1', date: '2026-01-12', testsCount: 4, samplesCount: 2, revenue: 1200, laborCost: 300 },
  { id: 'e2', methodId: 'm2', date: '2026-02-02', testsCount: 2, samplesCount: 1, revenue: 600, laborCost: 180 },
  { id: 'e3', methodId: 'm1', date: '2026-02-18', testsCount: 3, samplesCount: 2, revenue: 900, laborCost: 260 },
]