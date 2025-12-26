import React from "react";
import PPP from "../../features/documentation/pages/PPP"

function DevPPP() {
  const mockOrder = {
    id: 'o-1003',
    number: 'ZL-2025/010',
    status: 'protokół przyjęcia',
    client: { name: 'Volt Sp. z o.o.', address: 'ul. Energetyczna 5, 00-100 Warszawa', email: 'biuro@volt.pl' },
    report: { manufacturer: 'Volt Batteries', address: 'PL' },
    order: {
      subject: 'Akumulator rozruchowy 12V',
      model: 'VOLT-60',
      nominalCapacity: '60',
      nominalVoltage: '12',
      crankingCurrent: '540',
      sampleSize: 2,
      orderType: 'zew',
      sampleCodeKind: { AO: true, BP: false, AZ: false, INNE: false, inneText: '' },
      refGroups: [],
    },
    process: { sampleIntake: { received: true, receivedAt: '2025-10-01T09:30' }, intakeProtocol: {} },
  };
  return (
    <main style={{ padding: 20 }}>
      <h2 style={{ marginBottom: 12 }}>Podgląd PPP (DEV)</h2>
      <div style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 12 }}>
        <PPP order={mockOrder} onSave={(ppp)=>{console.log('PPP -> onSave(mock)', ppp); alert('Zapis (mock) — sprawdź konsolę.')}} onCancel={()=>alert('Anulowano (mock).')} />
      </div>
    </main>
  );
}

export function buildDevRoutes() {
  return [{ path: "dev/ppp", element: <DevPPP /> }];
}
