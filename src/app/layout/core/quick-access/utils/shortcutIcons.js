// src/app/layout/core/quick-access/utils/shortcutIcons.js
import React from 'react'
import {
  Home,
  LayoutDashboard,
  CalendarDays,
  ClipboardList,
  FileText,
  Folder,
  Users,
  User,
  BriefcaseBusiness,
  Wrench,
  Cog,
  MessageCircle,
  Mail,
  Bell,
  LineChart,
  BarChart3,
  FlaskConical,
  ClipboardCheck,
  BookOpen,
  ShieldCheck,
  Settings,
  HelpCircle,
} from 'lucide-react'

/**
 * Ikona NIE jest zapisywana w localStorage.
 * Wyliczamy ją zawsze z: id (preferowane) -> to (fallback) -> domyślna.
 *
 * Mieszamy:
 * - lucide-react (komponenty)
 * - Font Awesome Free (node <i className="...">)
 */

// helper FA → React node
const fa = (className, title) => (
  <i className={className} aria-hidden="true" title={title || undefined} />
)

/* =========================
   TWOJE IKONY (FA Free)
   ========================= */

// ✅ Rejestr próbek — bateria (Free najpewniej SOLID)
const FA_REGISTER_SAMPLES = fa('fa-solid fa-car-battery', 'Rejestr próbek')

// Rejestr zleceń
const FA_REGISTER_ORDERS = fa('fa-solid fa-cart-arrow-down', 'Rejestr zleceń')

// Rejestr badań
const FA_REGISTER_TESTS = fa('fa-solid fa-microscope', 'Rejestr badań')

// Rejestr wyposażenia
const FA_REGISTER_EQUIPMENT = fa('fa-solid fa-hammer', 'Rejestr wyposażenia')

// Harmonogram badań
const FA_SCHEDULE_TESTS = fa(
  'fa-regular fa-calendar-check',
  'Harmonogram badań'
)

/**
 * W mapach trzymamy:
 * - lucide component type (np. Home)
 * - React node (np. <i className="fa-..."/>)
 */

/* =========================
   1) MAPOWANIE PO ID
   ========================= */

const ICONS_BY_ID = {
  home: Home,
  dashboard: LayoutDashboard,
  board: CalendarDays,

  clients: Users,
  client: User,
  offers: BriefcaseBusiness,

  documents: FileText,

  equipment: Wrench,
  trainings: BookOpen,
  overtime: ClipboardCheck,

  messages: MessageCircle,
  mail: Mail,
  notifications: Bell,

  stats: LineChart,
  reports: BarChart3,

  admin: Cog,
  settings: Settings,
  security: ShieldCheck,

  help: HelpCircle,

  // Jeśli masz stałe id pod konkretne rejestry/harmonogram, możesz przypiąć tu:
  // samplesRegister: FA_REGISTER_SAMPLES,
  // ordersRegister: FA_REGISTER_ORDERS,
  // testsRegister: FA_REGISTER_TESTS,
  // equipmentRegister: FA_REGISTER_EQUIPMENT,
  // testsSchedule: FA_SCHEDULE_TESTS,
}

/* =========================
   2) FALLBACK PO `to`
   ========================= */

const ICONS_BY_TO_CONTAINS = [
  { match: '/dashboard', icon: LayoutDashboard },

  { match: '/tablica', icon: CalendarDays },
  { match: '/board', icon: CalendarDays },

  { match: '/klienci', icon: Users },
  { match: '/sprzedaż/oferty', icon: BriefcaseBusiness },
  { match: '/oferty', icon: BriefcaseBusiness },

  { match: '/dokumenty', icon: FileText },
  { match: '/documents', icon: FileText },

  { match: '/administracja/harmonogram', icon: CalendarDays },
  { match: '/administracja/nadgodziny', icon: ClipboardCheck },
  { match: '/administracja', icon: Cog },

  { match: '/wiadomości', icon: MessageCircle },
  { match: '/messages', icon: MessageCircle },

  { match: '/ustawienia', icon: Settings },
  { match: '/settings', icon: Settings },

  { match: '/raporty', icon: BarChart3 },
  { match: '/reports', icon: BarChart3 },

  /* ===== REJESTRY (FA) ===== */

  // Rejestr próbek — bateria
  { match: '/rejestr-probek', icon: FA_REGISTER_SAMPLES },
  { match: '/rejestr-próbek', icon: FA_REGISTER_SAMPLES },
  { match: '/samples-register', icon: FA_REGISTER_SAMPLES },

  // Rejestr zleceń
  { match: '/rejestr-zlecen', icon: FA_REGISTER_ORDERS },
  { match: '/rejestr-zleceń', icon: FA_REGISTER_ORDERS },
  { match: '/orders-register', icon: FA_REGISTER_ORDERS },

  // Rejestr badań
  { match: '/rejestr-badan', icon: FA_REGISTER_TESTS },
  { match: '/rejestr-badań', icon: FA_REGISTER_TESTS },
  { match: '/tests-register', icon: FA_REGISTER_TESTS },

  // Rejestr wyposażenia
  { match: '/rejestr-wyposazenia', icon: FA_REGISTER_EQUIPMENT },
  { match: '/rejestr-wyposażenia', icon: FA_REGISTER_EQUIPMENT },
  { match: '/equipment-register', icon: FA_REGISTER_EQUIPMENT },

  /* ===== HARMONOGRAM BADAŃ (FA) ===== */
  { match: '/harmonogram-badan', icon: FA_SCHEDULE_TESTS },
  { match: '/harmonogram-badań', icon: FA_SCHEDULE_TESTS },
  { match: '/badania/harmonogram', icon: FA_SCHEDULE_TESTS },

  // ogólne fallbacki
  { match: '/wyposażenie', icon: Wrench },
  { match: '/equipment', icon: Wrench },

  { match: '/samples', icon: FlaskConical },
  { match: '/register', icon: ClipboardList },
]

export function getShortcutIcon({ id, to } = {}) {
  const safeId = String(id ?? '').trim()
  if (safeId && ICONS_BY_ID[safeId]) return ICONS_BY_ID[safeId]

  const safeTo = String(to ?? '').trim()
  if (safeTo) {
    const hit = ICONS_BY_TO_CONTAINS.find((x) => safeTo.includes(x.match))
    if (hit?.icon) return hit.icon
  }

  return Folder
}
