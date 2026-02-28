import { startOfDay, format } from 'date-fns'
import { pl } from 'date-fns/locale'

export const today = () => startOfDay(new Date())
export const iso = (d) => format(d, 'yyyy-MM-dd')
export const fmt = (d, pat = 'EEE d MMM', loc = pl) => format(d, pat, { locale: loc })