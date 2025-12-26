export const sampleCalibrations = [
  { id: 'CAL-001', device: 'Termometr A', start: '2025-02-01', end: '2025-02-05', lab: 'LAB1', cost: 850 },
  { id: 'CAL-002', device: 'Termometr B', start: '2025-02-03', end: '2025-02-04', lab: 'LAB1', cost: 420 },
  { id: 'CAL-003', device: 'Manometr X',  start: '2025-02-10', end: '2025-02-15', lab: 'LAB2', cost: 1320 },
  { id: 'CAL-004', device: 'Waga 10kg',   start: '2025-02-12', end: '2025-02-18', lab: 'LAB3', cost: 2100 },
  { id: 'CAL-005', device: 'Termometr A', start: '2025-03-08', end: '2025-03-10', lab: 'LAB2', cost: 760 },
  { id: 'CAL-006', device: 'Waga 10kg',   start: '2025-03-20', end: '2025-03-22', lab: 'LAB1', cost: 980 },
]

export const sampleFailures = [
  { id: 'F-100', date: '2025-02-02', downtimeHours: 10, repairCost: 1200, device: 'Termometr A' },
  { id: 'F-101', date: '2025-02-06', downtimeHours: 4,  repairCost: 400,  device: 'Manometr X' },
  { id: 'F-102', date: '2025-02-13', downtimeHours: 16, repairCost: 3600, device: 'Waga 10kg' },
  { id: 'F-103', date: '2025-03-03', downtimeHours: 2,  repairCost: 300,  device: 'Termometr B' },
]
