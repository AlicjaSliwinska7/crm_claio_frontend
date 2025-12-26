// src/app/App.jsx
import React, { useEffect, useMemo } from 'react'
import { BrowserRouter as Router, useRoutes, useLocation } from 'react-router-dom'

import CommandPalette from '../shared/command-palette/components/CommandPalette';
import { NotificationsProvider } from './providers/NotificationsProvider.jsx'
import { PasswordModalProvider } from './providers/PasswordModalProvider.jsx'
import { ConfirmProvider } from './providers/ConfirmProvider.jsx'
import { GlobalModalProvider } from './providers/GlobalModalProvider.jsx'
import { MessagesProvider } from './providers/MessagesProvider.jsx'
import ChangePasswordModal from '../shared/modals/modals/ChangePasswordModal.jsx'
import { mountTopBarsOffsetObserver } from './layout/utils/navOffset.js'

import { AppDataProvider, useAppData } from './providers/AppDataProvider.jsx'
import buildAppRoutes from './routes'
import { PATHS } from './routes/paths'

function NavOffsetBoot() {
  const location = useLocation()
  useEffect(() => {
    const unmount = mountTopBarsOffsetObserver()
    return unmount
  }, [])
  useEffect(() => {
    requestAnimationFrame(() => {
      window.dispatchEvent(new Event('resize'))
      window.dispatchEvent(new Event('scroll'))
    })
  }, [location.pathname, location.search])
  return null
}

function AppRouter({ commands }) {
  const deps = useAppData()
  const routes = useMemo(() => buildAppRoutes(deps), [deps])
  const element = useRoutes(routes)
  return (
    <>
      <NavOffsetBoot />
      <CommandPalette commands={commands} />
      {element}
      <ChangePasswordModal />
    </>
  )
}

export default function App() {
  const commands = useMemo(() => ([
    { id: 'go-home', label: '🏠 Strona główna', hint: PATHS.HOME, action: (nav) => nav(PATHS.HOME) },
    { id: 'go-orders-docs', label: '📂 Dokumentacja → Zlecenia', hint: PATHS.DOCUMENTATION.ORDERS, action: (nav) => nav(PATHS.DOCUMENTATION.ORDERS) },
    { id: 'go-ppp-list', label: '🧪 PPP — lista', hint: PATHS.DOCUMENTATION.PPP_LIST, action: (nav) => nav(PATHS.DOCUMENTATION.PPP_LIST) },
    { id: 'go-pb-list', label: '🧭 Programy badań — lista', hint: PATHS.DOCUMENTATION.PB_LIST, action: (nav) => nav(PATHS.DOCUMENTATION.PB_LIST) },
    { id: 'go-kb-list', label: '🧾 Karty badań — lista', hint: PATHS.DOCUMENTATION.KB_LIST, action: (nav) => nav(PATHS.DOCUMENTATION.KB_LIST) },
    { id: 'go-logs', label: '📊 Logi badań (CSV) — lista', hint: PATHS.DOCUMENTATION.LOGS, action: (nav) => nav(PATHS.DOCUMENTATION.LOGS) },
    { id: 'go-otherinfo', label: '🗃 Inne informacje — lista', hint: PATHS.DOCUMENTATION.OTHER_INFO, action: (nav) => nav(PATHS.DOCUMENTATION.OTHER_INFO) },
    { id: 'go-reports', label: '📑 Sprawozdania — lista', hint: PATHS.DOCUMENTATION.REPORTS, action: (nav) => nav(PATHS.DOCUMENTATION.REPORTS) },
    { id: 'go-archive', label: '🗄 Archiwizacja — lista', hint: PATHS.DOCUMENTATION.ARCHIVE, action: (nav) => nav(PATHS.DOCUMENTATION.ARCHIVE) },

    { id: 'ops-hub', label: '🧭 Operacje: Kokpit', hint: PATHS.OPS.ROOT, action: (nav) => nav(PATHS.OPS.ROOT), group: 'Operacje' },
    { id: 'ops-to-register', label: 'Zlecenia do zarejestrowania', hint: PATHS.OPS.TO_REGISTER, action: (nav) => nav(PATHS.OPS.TO_REGISTER), group: 'Operacje' },
    { id: 'ops-awaiting-delivery', label: 'Oczekiwanie na dostawę', hint: PATHS.OPS.AWAITING_DELIVERY, action: (nav) => nav(PATHS.OPS.AWAITING_DELIVERY), group: 'Operacje' },
    { id: 'ops-samples-to-intake', label: 'Próbki do przyjęcia', hint: PATHS.OPS.SAMPLES_TO_INTAKE, action: (nav) => nav(PATHS.OPS.SAMPLES_TO_INTAKE), group: 'Operacje' },
    { id: 'ops-pb-to-prepare', label: 'PB do przygotowania', hint: PATHS.OPS.PB_TO_PREPARE, action: (nav) => nav(PATHS.OPS.PB_TO_PREPARE), group: 'Operacje' },
    { id: 'ops-tests-to-run', label: 'Badania do wykonania', hint: PATHS.OPS.TESTS_TO_RUN, action: (nav) => nav(PATHS.OPS.TESTS_TO_RUN), group: 'Operacje' },
    { id: 'ops-logs-to-prepare', label: 'Logi do przygotowania', hint: PATHS.OPS.LOGS_TO_PREPARE, action: (nav) => nav(PATHS.OPS.LOGS_TO_PREPARE), group: 'Operacje' },
    { id: 'ops-kb-to-prepare', label: 'KB do przygotowania', hint: PATHS.OPS.KB_TO_PREPARE, action: (nav) => nav(PATHS.OPS.KB_TO_PREPARE), group: 'Operacje' },
    { id: 'ops-reports-to-prepare', label: 'Sprawozdania do przygotowania', hint: PATHS.OPS.REPORTS_TO_PREPARE, action: (nav) => nav(PATHS.OPS.REPORTS_TO_PREPARE), group: 'Operacje' },
    { id: 'ops-archive-docs', label: 'Dokumentacja do archiwizacji', hint: PATHS.OPS.DOCS_TO_ARCHIVE, action: (nav) => nav(PATHS.OPS.DOCS_TO_ARCHIVE), group: 'Operacje' },
  ]), [])

  return (
    <ConfirmProvider>
      <NotificationsProvider>
        <MessagesProvider>
          <PasswordModalProvider>
            <GlobalModalProvider>
              <AppDataProvider>
                <Router>
                  <AppRouter commands={commands} />
                </Router>
              </AppDataProvider>
            </GlobalModalProvider>
          </PasswordModalProvider>
        </MessagesProvider>
      </NotificationsProvider>
    </ConfirmProvider>
  )
}
