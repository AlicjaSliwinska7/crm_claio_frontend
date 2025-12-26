// src/app/layout/hooks/usePageTitle.js
import { useLocation } from 'react-router-dom'
import { useMemo } from 'react'

import { MENU as LEFT_MENU } from '../bars/LeftSideBar/config'
import { MENU as RIGHT_MENU } from '../bars/RightSidebar/config'
import { MENU as LOWER_MENU } from '../bars/LowerNavBar/config'

import {
  Home,
  Building2,
  CalendarDays,
  FileText,
  Users,
  ClipboardList,
  FlaskConical,
  LineChart,
  ListChecks,
  FolderOpen,
  Book,
  Settings,
  MessagesSquare,
  Wrench,
  ShieldCheck,
  Workflow,
  Bell,
  Drill,
  TestTubeDiagonal,
  GraduationCap,
  ScrollText,
  User,
  Search,
  SearchCheck   
} from '../../../shared/ui/icons'

// ===== Helpers =====
const uc = s => (s ? s.toLocaleUpperCase('pl-PL') : '')

const pad2 = n => (n < 10 ? `0${n}` : `${n}`)
const fmtDatePL = iso => {
  const m = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(iso)
  if (!m) return iso
  const [, y, mo, d] = m
  return `${pad2(+d)}.${pad2(+mo)}.${y}`
}
const titleCase = s =>
  s
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
    .replace(/(^.| [^\s])/g, m => m.toUpperCase())

const statusLabels = {
  draft: 'W przygotowaniu',
  sent: 'Wysłana',
  accepted: 'Przyjęta',
  rejected: 'Odrzucona',
  assigned: 'Przydzielone',
  unassigned: 'Nieprzydzielone',
  in_progress: 'W trakcie',
  done: 'Zakończone',
}

const buildSubtitle = (_pathname, search) => {
  const params = new URLSearchParams(search || '')
  const items = []

  const df = params.get('dateFrom') || params.get('from')
  const dt = params.get('dateTo') || params.get('to')
  if (df && dt) items.push(`Zakres: ${fmtDatePL(df)} – ${fmtDatePL(dt)}`)
  else if (df) items.push(`Od: ${fmtDatePL(df)}`)
  else if (dt) items.push(`Do: ${fmtDatePL(dt)}`)

  const statusRaw = params.get('status')
  if (statusRaw) {
    const labels = statusRaw.split(',').map(s => statusLabels[s.trim()] || titleCase(s.replace(/_/g, ' ')))
    items.push(`Status: ${labels.join(', ')}`)
  }

  const clientId = params.get('clientId') || params.get('client')
  if (clientId) items.push(`Klient: #${clientId}`)

  const owner = params.get('owner')
  if (owner) items.push(`Właściciel: ${titleCase(owner.replace(/[_-]/g, ' '))}`)

  const sort = params.get('sort')
  if (sort) {
    const [field, dir] = sort.split(':')
    items.push(`Sort: ${titleCase(field.replace(/[_-]/g, ' '))}${dir ? ` ${dir.toUpperCase()}` : ''}`)
  }



  return items.length ? items.join(' · ') : null
}

// ===== Spłaszczanie menu =====
const flattenSideSections = (sections = []) => {
  const out = []
  for (const sec of sections) {
    const baseTo = sec.base || (sec.id ? `/${sec.id}` : null)
    if (sec.label && baseTo) {
      out.push({
        to: baseTo,
        label: sec.label,
        iconClass: sec.iconClass || '',
        sectionId: sec.id || null,
      })
    }
    if (Array.isArray(sec.items)) {
      for (const it of sec.items) {
        if (!it?.to || !it?.label) continue
        out.push({
          to: it.to,
          label: it.label,
          iconClass: it.iconClass || sec.iconClass || '',
          sectionId: sec.id || null,
        })
      }
    }
  }
  return out
}

const flattenLowerMenu = (items = []) => {
  const out = []
  for (const it of items) {
    if (it?.type === 'link' && it.to && it.label) {
      out.push({ to: it.to, label: it.label, iconClass: it.iconClass || '', sectionId: it.id || null })
    }
    if (it?.type === 'dropdown') {
      if (it.to && it.label) {
        out.push({ to: it.to, label: it.label, iconClass: it.iconClass || '', sectionId: it.id || null })
      }
      if (Array.isArray(it.items)) {
        for (const sub of it.items) {
          if (sub?.kind === 'link' && sub.to && sub.label) {
            out.push({
              to: sub.to,
              label: sub.label,
              iconClass: sub.iconClass || it.iconClass || '',
              sectionId: it.id || null,
            })
          }
        }
      }
    }
  }
  return out
}

const NAV_FLAT = [
  ...flattenSideSections(LEFT_MENU),
  ...flattenSideSections(RIGHT_MENU),
  ...flattenLowerMenu(LOWER_MENU),
].sort((a, b) => b.to.length - a.to.length)

// ===== Mapy etykiet =====
const titleMap = {
  '/': { label: 'Strona główna', Icon: Building2 },
  '/tablica': { label: 'Tablica', Icon: ListChecks },
  '/tablica/podglad': { label: 'Tablica – podgląd', Icon: ListChecks },
  '/profil': { label: 'Profil', Icon: User, suppressHeading: true },

  '/wiadomosci': { label: 'Wiadomości – skrzynka', Icon: MessagesSquare },
  '/powiadomienia/wszystkie': { label: 'Powiadomienia – wszystkie', Icon: MessagesSquare },
  '/powiadomienia/nieprzeczytane': { label: 'Powiadomienia – nieprzeczytane', Icon: MessagesSquare },

  '/ustawienia/skroty': { label: 'Ustawienia – Zarządzaj skrótami', Icon: Settings },

  '/administracja': { label: 'Administracja', Icon: Building2 },
  '/administracja/kontakty': { label: 'Administracja – lista kontaktowa', Icon: Building2 },
  '/administracja/harmonogram': { label: 'Administracja – harmonogram laboratorium', Icon: CalendarDays },
  '/administracja/dokumenty': { label: 'Administracja – dokumenty', Icon: FileText },
  '/administracja/szkolenia': { label: 'Administracja – szkolenia', Icon: Book },
  '/administracja/spotkania': { label: 'Administracja – spotkania', Icon: CalendarDays },
  '/administracja/zamowienia': { label: 'Administracja – zamówienia', Icon: FileText },

  '/sprzedaz': { label: 'Sprzedaż', Icon: LineChart },
  '/sprzedaz/klienci': { label: 'Sprzedaż – klienci', Icon: Users },
  '/sprzedaz/oferty': { label: 'Sprzedaż – oferty', Icon: FileText },
  '/sprzedaz/rejestr-zlecen': { label: 'Sprzedaż – rejestr zleceń', Icon: ClipboardList },
  '/sprzedaz/cennik': { label: 'Sprzedaż – cennik', Icon: FileText },
  '/sprzedaz/zestawienia': { label: 'Sprzedaż – zestawienia', Icon: LineChart },

  '/probki': { label: 'Próbki', Icon: FlaskConical },
  '/probki/rejestr-probek': { label: 'Próbki – rejestr próbek', Icon: FlaskConical },
  '/probki/dostawa-i-odbior': { label: 'Próbki – dostawa i odbiór', Icon: FlaskConical },
  '/probki/utylizacja': { label: 'Próbki – do utylizacji', Icon: FlaskConical },
  '/probki/zestawienie': { label: 'Próbki – zestawienie', Icon: LineChart },

  '/badania': { label: 'Badania', Icon: FlaskConical },
  '/badania/rejestr-badan': { label: 'Badania – rejestr badań', Icon: FlaskConical },
  '/badania/harmonogram': { label: 'Badania – harmonogram', Icon: CalendarDays },
  '/badania/zestawienie': { label: 'Badania – zestawienie', Icon: LineChart },

  '/raporty': { label: 'Raporty', Icon: LineChart },

  '/dokumentacja': { label: 'Dokumentacja', Icon: FileText },
  '/dokumentacja/oferty': { label: 'Dokumentacja – oferty', Icon: FileText },
  '/dokumentacja/zlecenia': { label: 'Dokumentacja – zlecenia', Icon: FileText },
  '/dokumentacja/karty-kalkulacyjne': { label: 'Dokumentacja – karty kalkulacyjne', Icon: FileText },
  '/dokumentacja/ppp': { label: 'Dokumentacja – protokoły przyjęcia próbki', Icon: FileText },
  '/dokumentacja/pb': { label: 'Dokumentacja – programy badań', Icon: FileText },
  '/dokumentacja/karty-badan': { label: 'Dokumentacja – karty badań', Icon: FileText },
  '/dokumentacja/logi': { label: 'Dokumentacja – logi', Icon: FileText },
  '/dokumentacja/inne-informacje': { label: 'Dokumentacja – inne informacje', Icon: FileText },
  '/dokumentacja/sprawozdania': { label: 'Dokumentacja – sprawozdania z badań', Icon: FileText },
  '/dokumentacja/archiwizacja': { label: 'Dokumentacja – archiwizacja', Icon: FileText },

  '/metody-badawcze/spis': { label: 'Metody badawcze – spis', Icon: Book },

  '/wyposazenie': { label: 'Wyposażenie', Icon: FolderOpen },
  '/wyposazenie/rejestr-wyposazenia': { label: 'Wyposażenie – rejestr wyposażenia badawczego', Icon: FolderOpen },
  '/wyposazenie/laboratoria-wzorcowania': { label: 'Wyposażenie – laboratoria wzorcowania', Icon: FolderOpen },
  '/wyposazenie/harmonogram-wzorcowania': { label: 'Wyposażenie – harmonogram wzorcowania', Icon: CalendarDays },
  '/wyposazenie/zestawienie': { label: 'Wyposażenie – zestawienie', Icon: LineChart },

  '/terminy/moje': { label: 'Terminy – mój grafik', Icon: CalendarDays },
  '/terminy/zaplanuj-grafik': { label: 'Terminy – zaplanuj grafik', Icon: CalendarDays },
  '/terminy/zestawienie': { label: 'Terminy – zestawienie', Icon: LineChart },

  '/zadania': { label: 'Zadania', Icon: ListChecks },
  '/zadania/nowe': { label: 'Zadania – nowe zadanie', Icon: ListChecks },
  '/zadania/moje': { label: 'Zadania – moje', Icon: ListChecks },
  '/zadania/monitoring': { label: 'Zadania – monitoruj', Icon: ListChecks },
  '/zadania/nieprzydzielone': { label: 'Zadania – nieprzydzielone', Icon: ListChecks },
  '/zadania/harmonogram-zadan': { label: 'Zadania – harmonogram zadań', Icon: CalendarDays },
  '/zadania/zestawienie': { label: 'Zadania – zestawienie', Icon: LineChart },
}

// Reguły dynamiczne
const dynamicTitleRules = [
  {
    test: /^\/sprzedaz\/klienci\/([^/]+)$/,
    build: ([, s]) => ({ label: `Sprzedaż – klienci – ${decodeURIComponent(s)}` }),
  },
  {
    test: /^\/sprzedaz\/oferty\/([^/]+)$/,
    build: ([, s]) => ({ label: `Sprzedaż – oferty – oferta nr: ${decodeURIComponent(s)}` }),
  },
  {
    test: /^\/sprzedaz\/zlecenia\/([^/]+)$/,
    build: ([, s]) => ({ label: `Sprzedaż – zlecenia – zlecenie nr: ${decodeURIComponent(s)}` }),
  },
  {
    test: /^\/probki\/rejestr-probek\/([^/]+)$/,
    build: ([, s]) => ({ label: `Próbki – rejestr próbek – oznaczenie próbek: ${decodeURIComponent(s)}` }),
  },
  {
    test: /^\/administracja\/szkolenia\/([^/]+)$/,
    build: ([, s]) => ({ label: `Administracja – szkolenia – ${decodeURIComponent(s)}` }),
  },
  {
    test: /^\/administracja\/spotkania\/([^/]+)$/,
    build: ([, s]) => ({ label: `Administracja – spotkania – ${decodeURIComponent(s)}` }),
  },
]

// Ikony outline po sekcji
const SECTION_OUTLINE_ICON = {
  administracja: Building2,
  sprzedaz: LineChart,
  probki: TestTubeDiagonal,
  badania: FlaskConical,
  wyposazenie: Drill,
  dokumentacja: FolderOpen,
  'metody-badawcze': ScrollText,
  operacje: Workflow,
  'baza-wiedzy': GraduationCap,
  terminy: CalendarDays,
  narzedzia: Wrench,
  zadania: ListChecks,
  qa: ShieldCheck,
  home: Home,
  tablica: ClipboardList,
  wiadomosci: MessagesSquare,
  powiadomienia: Bell,
  ustawienia: Settings,
  szukaj: SearchCheck
}

// ===== Główny hook =====
export default function usePageTitle() {
  const { pathname, search } = useLocation()

  return useMemo(() => {
    const decoded = decodeURIComponent(pathname)

    const navHit = NAV_FLAT.find(n => n.to === decoded) || NAV_FLAT.find(n => decoded.startsWith(n.to + '/'))

    const iconClass = navHit?.iconClass || ''
    const OutlineIcon = navHit?.sectionId ? SECTION_OUTLINE_ICON[navHit.sectionId] || null : null

    // pack: wstrzykujemy ewentualne pola dodatkowe (np. suppressHeading dla /profil)
    const pack = (label, extra = {}) => ({
      title: uc(label || ''),
      iconClass,
      Icon: OutlineIcon || null,
      subtitle: buildSubtitle(decoded, search),
      ...extra,
    })

    // 1) reguły dynamiczne
    for (const rule of dynamicTitleRules) {
      const m = decoded.match(rule.test)
      if (m) {
        const built = rule.build(m) || {}
        return pack(built.label)
      }
    }

    // 1.1) WYSZUKIWANIE — własny tytuł i własna ikona (niezależna od menu)
    if (decoded === '/szukaj' || decoded.startsWith('/szukaj/')) {
      const qs = new URLSearchParams(search || '')
      const q = qs.get('q')
      const base = 'Wyniki wyszukiwania'
      const label = q ? `${base}: ${q}` : base
      return pack(label, { Icon: SearchCheck })
    }

    // 2) exact titleMap (z ewentualnym suppressHeading)
    if (titleMap[decoded]) {
      const item = titleMap[decoded]
      const extra = item.suppressHeading ? { suppressHeading: true } : {}
      return pack(item.label, extra)
    }

    // 3) prefix + sufiks
    const segments = decoded.split('/').filter(Boolean)
    if (segments.length > 1) {
      for (let i = segments.length; i > 0; i--) {
        const prefix = '/' + segments.slice(0, i).join('/')
        if (titleMap[prefix]) {
          const base = titleMap[prefix].label
          const rest = segments
            .slice(i)
            .map(s => s.replace(/-/g, ' '))
            .join(' – ')
          return pack(rest ? `${base} – ${rest}` : base)
        }
      }
    }

    // 4) fallback
    const fallback = segments.length ? segments.map(s => s.replace(/-/g, ' ')).join(' – ') : ''
    return pack(fallback)
  }, [pathname, search])
}
