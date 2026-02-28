// src/features/board/utils/holidays.js
import { addDays } from 'date-fns'

function getEasterSunday(year) {
  const a = year % 19
  const b = Math.floor(year / 100)
  const c = year % 100
  const d = Math.floor(b / 4)
  const e = b % 4
  const f = Math.floor((b + 8) / 25)
  const g = Math.floor((b - f + 1) / 3)
  const h = (19 * a + b - d - g + 15) % 30
  const i = Math.floor(c / 4)
  const k = c % 4
  const l = (32 + 2 * e + 2 * i - h - k) % 7
  const m = Math.floor((a + 11 * h + 22 * l) / 451)
  const month = Math.floor((h + l - 7 * m + 114) / 31)
  const day = ((h + l - 7 * m + 114) % 31) + 1
  return new Date(year, month - 1, day)
}

/**
 * Stałe święta PL + ruchome: Poniedziałek Wielkanocny i Boże Ciało
 */
export function getPolishHolidays(year) {
  const easterSunday = getEasterSunday(year)
  const easterMonday = addDays(easterSunday, 1)
  const corpusChristi = addDays(easterSunday, 60)

  return [
    new Date(year, 0, 1),   // Nowy Rok
    new Date(year, 0, 6),   // Trzech Króli
    easterMonday,           // Poniedziałek Wielkanocny
    new Date(year, 4, 1),   // 1 maja
    new Date(year, 4, 3),   // 3 maja
    corpusChristi,          // Boże Ciało
    new Date(year, 7, 15),  // 15 sierpnia
    new Date(year, 10, 1),  // 1 listopada
    new Date(year, 10, 11), // 11 listopada
    new Date(year, 11, 25), // 25 grudnia
    new Date(year, 11, 26), // 26 grudnia
  ]
}