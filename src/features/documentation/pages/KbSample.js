// src/components/pages/contents/kbSample.js
export const kbAuthors = [
  { id: 'a1', name: 'Zespół QA' },
  { id: 'a2', name: 'Laboratorium Chemiczne' },
];

export const kbCategories = [
  { id: 'c1', name: 'Procedury' },
  { id: 'c2', name: 'Instrukcje' },
  { id: 'c3', name: 'Ustalenia wewnętrzne' },
];

export const kbArticles = [
  {
    id: 'kb-001',
    title: 'Przyjęcie próbek – szybka instrukcja',
    status: 'approved',               // draft | review | approved | archived
    category: 'Instrukcje',
    tags: ['próbki','przyjęcie','rejestr'],
    equipment: ['Rejestrator R-12'],
    content: 'Krok 1: Weryfikacja dokumentów...\nKrok 2: Nadanie kodu...\nKrok 3: Oznakowanie...',
    createdAt: '2025-06-12',
    updatedAt: '2025-09-01',
    validUntil: '2026-06-30',
    authorId: 'a1',
  },
  {
    id: 'kb-002',
    title: 'Czyszczenie wag analitycznych',
    status: 'review',
    category: 'Procedury',
    tags: ['wagi','czyszczenie','BHP'],
    equipment: ['Waga AX205'],
    content: '1) Wyłącz urządzenie.\n2) Usuń pył antystatyczną szczoteczką...\n3) Alkohol izopropylowy 70%...',
    createdAt: '2025-07-02',
    updatedAt: '2025-07-20',
    validUntil: '2025-10-01',
    authorId: 'a2',
  },
  {
    id: 'kb-003',
    title: 'Uzgodnienie: oznaczanie odpadów chemicznych',
    status: 'approved',
    category: 'Ustalenia wewnętrzne',
    tags: ['odpady','chemia','etykiety'],
    equipment: [],
    content: 'Wszystkie odpady ciekłe oznaczamy etykietą żółtą z kodem EWC...\nMagazyn tymczasowy – regał 3.',
    createdAt: '2025-05-10',
    updatedAt: '2025-08-28',
    validUntil: '2026-05-31',
    authorId: 'a1',
  },
];

export const kbQuickLinks = [
  { title: 'Rejestr przyjęcia próbek', href: '/probki/rejestr-probek' },
  { title: 'Instrukcje', href: '/instrukcje' },
];

export const kbAuthorById = (id) => kbAuthors.find(a => a.id === id) || null;
export const kbCategoryById = (id) => kbCategories.find(c => c.id === id) || null;

// Zapewnij oba eksporty:
export const KB_SAMPLE = kbArticles;   // <- to naprawia import { KB_SAMPLE } from './kbSample'
export default kbArticles;             // <- default dla import foo from './kbSample'
export const kbAllTags = Array.from(new Set(kbArticles.flatMap(a => a.tags || [])));
