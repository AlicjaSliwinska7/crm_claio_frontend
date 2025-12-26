// src/routes/adminRoutes.jsx
import React, { Suspense, lazy } from 'react'
import { Navigate } from 'react-router-dom'

// Prosty fallback (możesz podmienić na spinner z waszego UI)
const Fallback = () => <div style={{ padding: 16 }}>Ładowanie…</div>

// Code-splitting stron administracji
const ContactsList = lazy(() =>
  import('../../features/administration/pages/ContactsList.jsx')
)

const AppointmentsRegister = lazy(() =>
  import('../../features/administration/pages/AppointmentsRegister.jsx')
)

const Appointment = lazy(() =>
  import('../../features/administration/pages/Appointment.js')
)

const Documents = lazy(() =>
  import('../../features/administration/pages/DocumentsList.jsx')
)

const Trainings = lazy(() =>
  import('../../features/administration/pages/TrainingsDirectory.jsx')
)

const Training = lazy(() =>
  import('../../features/administration/pages/Training.js')
)

const ShoppingListRegister = lazy(() =>
  import('../../features/administration/pages/ShoppingListRegister.jsx')
)

const LabSchedule = lazy(() =>
  import('../../features/administration/pages/LabSchedule.jsx')
)

// Helper do opakowania w Suspense (żeby nie powtarzać się przy każdym elemencie)
const withSuspense = (node) => <Suspense fallback={<Fallback />}>{node}</Suspense>

export function buildAdminRoutes(deps) {
  const {
    schedule,
    setSchedule,
    customHolidays,
    setCustomHolidays,
    employees,
    isHoliday, // zostawiam, jeżeli LabSchedule tego potrzebuje
  } = deps

  return [
    {
      path: 'administracja',
      children: [
        { index: true, element: <Navigate to="kontakty" replace /> },

        { path: 'kontakty', element: withSuspense(<ContactsList />) },

        {
          path: 'harmonogram',
          element: withSuspense(
            <LabSchedule
              schedule={schedule}
              setSchedule={setSchedule}
              customHolidays={customHolidays}
              setCustomHolidays={setCustomHolidays}
              employees={employees}
              isHoliday={isHoliday}
            />
          ),
        },

        { path: 'dokumenty', element: withSuspense(<Documents />) },

        {
          path: 'szkolenia',
          children: [
            { index: true, element: withSuspense(<Trainings />) },
            { path: ':id', element: withSuspense(<Training />) },
          ],
        },

        { path: 'spotkania', element: withSuspense(<AppointmentsRegister />) },
        { path: 'spotkania/:id', element: withSuspense(<Appointment />) },

        { path: 'zamowienia', element: withSuspense(<ShoppingListRegister />) },
      ],
    },
  ]
}
