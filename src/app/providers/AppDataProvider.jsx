import React, { createContext, useContext, useMemo, useState } from 'react'
import { format, isWeekend, parseISO, isSameDay } from 'date-fns'
import * as fx from '../__fixtures__/appData.fixtures.js'
const AppDataCtx = createContext(null)
export const useAppData = () => useContext(AppDataCtx)

export function AppDataProvider({ children }) {
  const [schedule, setSchedule] = useState({})
  const [customHolidays, setCustomHolidays] = useState([])
  const [ordersRegister, setOrdersRegister] = useState(fx.initialOrdersRegister)
  const [tasks, setTasks] = useState(fx.initialTasks)
  const [appointments, setAppointments] = useState([])
  const [trainingsData, setTrainingsData] = useState([])
  const [posts, setPosts] = useState([])
  const [samples, setSamples] = useState(fx.initialSamples)
  const [offers, setOffers] = useState(fx.initialOffers)
  const [clients, setClients] = useState(fx.initialClients)

  const staticPolishHolidays = fx.staticPolishHolidays.map(d => parseISO(d))
  const isStaticHoliday = (day) => staticPolishHolidays.some(h => isSameDay(h, day))
  const isHoliday = (day) => {
    const dateStr = format(day, 'yyyy-MM-dd')
    return isWeekend(day) || isStaticHoliday(day) || customHolidays.includes(dateStr)
  }

  const employees = fx.employees

  const value = useMemo(() => ({
    // data
    schedule, customHolidays, ordersRegister, tasks, appointments, trainingsData, posts, samples, offers, clients, employees,
    // setters
    setSchedule, setCustomHolidays, setOrdersRegister, setTasks, setSamples, setOffers, setClients,
    // utils
    isHoliday,
  }), [
    schedule, customHolidays, ordersRegister, tasks, appointments, trainingsData, posts, samples, offers, clients, employees
  ])

  return <AppDataCtx.Provider value={value}>{children}</AppDataCtx.Provider>
}
