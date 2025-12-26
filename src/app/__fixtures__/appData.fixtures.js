// src/app/__fixtures__/appData.fixtures.js

// ————— DATY ŚWIĄT
export const staticPolishHolidays = [
  '2025-01-01',
  '2025-01-06',
  '2025-04-20',
  '2025-04-21',
  '2025-05-01',
  '2025-05-03',
  '2025-06-08',
  '2025-06-19',
  '2025-08-15',
  '2025-11-01',
  '2025-11-11',
  '2025-12-25',
  '2025-12-26',
];

// ————— REJESTR ZLECEŃ
export const initialOrdersRegister = [
  {
    id: 'ORD-001',
    receivedDate: '2025-07-09',
    orderNumber: 'ZL-2025/001',
    client: 'TechSolutions Sp. z o.o.',
    calcCard: 'KK-2025/045',
    scope: 'ISO 527-1:2019 / 3 pkt',
    subject: 'Tworzywo sztuczne – płyta PE (typ A)',
    quantity: 3,
    code: 'A123',
    price: '22 300,00 zł',
    hours: '6 [1 800,00 zł]',
    utilized: true,
    workCode: 'LAB-PE-01',
    stage: 'w trakcie badań',
    notes: 'Próbka częściowo uszkodzona',
  },
  {
    id: 'ORD-002',
    receivedDate: '2025-07-08',
    orderNumber: 'ZL-2025/002',
    client: 'GreenEnergy S.A.',
    calcCard: 'KK-2025/052',
    scope: 'PN-EN 50395:2000 / 2 pkt',
    subject: 'Kabel elektryczny (typ B)',
    quantity: 5,
    code: 'B456',
    price: '8 750,00 zł',
    hours: '4 [1 100,00 zł]',
    utilized: false,
    workCode: 'LAB-EL-02',
    stage: 'zarejestrowane',
    notes: '',
  },
];

// ————— ZADANIA
export const initialTasks = [
  { id: 'T-001', title: 'Przygotować raport z badań – wrzesień', dueDate: '2025-09-22', assignees: ['Alicja Śliwińska', 'Jan Kowalski'], status: 'w toku' },
  { id: 'T-002', title: 'Uzupełnić checklisty audytu wewnętrznego', date: '2025-09-23', assignees: ['Alicja Śliwińska'], status: 'przydzielone' },
  { id: 'T-003', title: 'Zweryfikować dane kalibracji wagosuszarki', targetDate: '2025-09-24', assignees: ['Alicja Śliwińska', 'Anna Nowak'], status: 'do zrobienia' },
  { id: 'T-004', title: 'Wprowadzić oferty IX/2025 do systemu', dueDate: '2025-09-27', assignees: ['Alicja Śliwińska'], status: 'w toku' },
  { id: 'T-005', title: 'Przygotować próbki do badań (kod: A123)', date: '2025-09-29', assignees: ['Alicja Śliwińska', 'Piotr Kowalski'], status: 'do zrobienia' },
  { id: 'T-006', title: 'Aktualizacja instrukcji przyjęcia próbek', targetDate: '2025-10-02', assignees: ['Alicja Śliwińska'], status: 'w toku' },
  { id: 'T-007', title: 'Test – nie przypisany do Alicji', dueDate: '2025-09-25', assignees: ['Jan Kowalski'], status: 'w toku' },
];

// ————— PRÓBKI
export const initialSamples = [
  {
    id: 'SP-001',
    receivedDate: '2025-07-09',
    contractNumber: 'ZL-2025/001',
    code: 'A123',
    sampleNumber: '001',
    subject: 'Tworzywo sztuczne – płyta PE',
    quantity: 3,
    client: 'TechSolutions Sp. z o.o.',
    scope: 'ISO 527-1:2019 / 3 pkt',
    disposal: 'likwidacja',
    notes: '',
    status: 'w trakcie badań',
    returnDate: '',
    comment: 'Próbka częściowo uszkodzona',
  },
  {
    id: 'SP-002',
    receivedDate: '2025-07-08',
    contractNumber: 'ZL-2025/002',
    code: 'B456',
    sampleNumber: '002',
    subject: 'Kabel elektryczny',
    quantity: 5,
    client: 'GreenEnergy S.A.',
    scope: 'PN-EN 50395:2000 / 2 pkt',
    disposal: 'zwrot',
    notes: 'Próbki opisane markerem',
    status: 'zarejestrowane',
    returnDate: '',
    comment: '',
  },
];

// ————— OFERTY
export const initialOffers = [
  {
    id: 'OFT-001_2025',
    company: 'TechSolutions Sp. z o.o.',
    contactPerson: 'Jan Kowalski',
    contactEmail: 'j.kowalski@techsolutions.pl',
    createDate: '2025-06-20',
    expiryDate: '2025-07-15',
    status: 'w przygotowaniu',
    amount: '12 500,00 zł',
    subject: 'Analiza chemiczna próbek tworzyw sztucznych',
    sampleSize: '10',
    standard: 'ISO 11357-1:2016',
  },
  {
    id: 'OFT-002_2025',
    company: 'GreenEnergy S.A.',
    contactPerson: 'Anna Zielińska',
    contactEmail: 'j.kowalski@techsolutions.pl',
    createDate: '2025-07-15',
    expiryDate: '2025-07-10',
    status: 'wysłana',
    amount: '8 750,00 zł',
    subject: 'Badanie emisji spalin',
    sampleSize: '5',
    standard: 'PN-EN 14792:2017',
  },
  {
    id: 'OFT-003_2025',
    company: 'Meditech Polska',
    contactPerson: 'Tomasz Wójcik',
    contactEmail: 'j.kowalski@techsolutions.pl',
    createDate: '2025-07-15',
    expiryDate: '2025-06-30',
    status: 'przyjęta',
    amount: '22 300,00 zł',
    subject: 'Testy wytrzymałościowe narzędzi chirurgicznych',
    sampleSize: '12',
    standard: 'EN ISO 13485:2016',
  },
];

// ————— KLIENCI
export const initialClients = [
  {
    name: 'TechSolutions Sp. z o.o.',
    NIP: '123-456-78-90',
    email: 'biuro@techsolutions.pl',
    website: 'https://techsolutions.pl',
    address: { street: 'ul. Informatyczna', buildingNumber: '15A', postalCode: '00-950', city: 'Warszawa', country: 'Polska' },
    contactAddress: { street: 'ul. Leśna', buildingNumber: '7', postalCode: '00-001', city: 'Piaseczno', country: 'Polska' },
    contactPerson: 'Jan Kowalski',
    contactPhone: '+48 501 234 567',
    contactEmail: 'j.kowalski@techsolutions.pl',
  },
  {
    name: 'GreenEnergy S.A.',
    NIP: '789-012-34-56',
    email: 'kontakt@greenenergy.pl',
    website: 'https://greenenergy.pl',
    address: { street: 'ul. Ekologiczna', buildingNumber: '3B', postalCode: '30-300', city: 'Kraków', country: 'Polska' },
    contactAddress: { street: 'ul. Przemysłowa', buildingNumber: '9', postalCode: '30-302', city: 'Kraków', country: 'Polska' },
    contactPerson: 'Anna Zielińska',
    contactPhone: '+48 601 987 654',
    contactEmail: 'a.zielinska@greenenergy.pl',
  },
  {
    name: 'Meditech Polska',
    NIP: '456-789-01-23',
    email: 'info@meditech.pl',
    website: 'https://meditech.pl',
    address: { street: 'ul. Zdrowa', buildingNumber: '88', postalCode: '60-123', city: 'Poznań', country: 'Polska' },
    contactAddress: { street: 'ul. Serwisowa', buildingNumber: '5C', postalCode: '60-125', city: 'Poznań', country: 'Polska' },
    contactPerson: 'Tomasz Wójcik',
    contactPhone: '+48 602 321 000',
    contactEmail: 't.wojcik@meditech.pl',
  },
];

// ————— PRACOWNICY
export const employees = [
  'Alicja Śliwińska',
  'Jan Kowalski',
  'Anna Nowak',
  'Piotr Kowalski',
  'Maria Zielińska',
  'Tomasz Wójcik',
  'Ewa Dąbrowska',
  'Paweł Lewandowski',
  'Karolina Mazur',
  'Jan Kaczmarek',
  'Aleksandra Szymańska',
];
