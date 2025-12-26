// src/features/tests/components/KPIs.jsx
import React, { memo, useMemo } from 'react'
import PropTypes from 'prop-types'
import { Gauge, BadgeCheck, Clock3, Calendar, CalendarCheck } from 'lucide-react'

import {
	Section,
	KpiCard,
	KpisGrid,
	summaryFormatters, // { safeNum, fmtDatePL, isoDate, fmtPLN }
} from '../../../../shared/summaries'

const ICON_SIZE = 16

function KPIs({ totals = {}, fmtPLN }) {
	const { safeNum, fmtDatePL, isoDate, fmtPLN: fmtPLNShared } = summaryFormatters
	const formatPLN = fmtPLN || fmtPLNShared

	// Bezpieczne odczyty liczb
	const methods = safeNum(totals.methods)
	const tests = safeNum(totals.tests)
	const samples = safeNum(totals.samples)
	const revenueNum = safeNum(totals.revenue)
	const laborNum = safeNum(totals.labor)
	const marginNum = safeNum(totals.margin)
	const accCnt = safeNum(totals.accCnt)
	const tatWeighted = safeNum(totals.tatWeighted)
	const lastFrom = totals.lastFrom ?? null
	const lastTo = totals.lastTo ?? null

	// Stabilne etykiety/formaty
	const tatLabel = useMemo(() => `${(Number.isFinite(tatWeighted) ? tatWeighted : 0).toFixed(1)} d`, [tatWeighted])
	const revenue = useMemo(() => formatPLN(revenueNum), [revenueNum, formatPLN])
	const labor = useMemo(() => formatPLN(laborNum), [laborNum, formatPLN])
	const margin = useMemo(() => formatPLN(marginNum), [marginNum, formatPLN])

	return (
		<Section
			title='Podsumowanie (wg bieżących filtrów tabeli)'
			icon={<Gauge className='es-headIcon' aria-hidden='true' />}>
			<KpisGrid>
				<KpiCard value={methods} label='Metody (łącznie)' ariaLabel='Metody łącznie' />
				<KpiCard value={tests} label='Badania' />
				<KpiCard value={samples} label='Próbki' />

				<KpiCard value={revenue} label='Przychód' />
				<KpiCard value={labor} label='Koszt RH' />
				<KpiCard value={margin} label='Marża' />

				<KpiCard
					icon={<BadgeCheck size={ICON_SIZE} aria-hidden='true' />}
					value={
						<>
							{accCnt} / {methods}
						</>
					}
					label='Akredytowane'
					ariaLabel={`Akredytowane: ${accCnt} z ${methods}`}
					title='Liczba metod akredytowanych / wszystkich metod'
				/>

				<KpiCard
					icon={<Clock3 size={ICON_SIZE} aria-hidden='true' />}
					value={tatLabel}
					label='Śr. TAT (ważona)'
					ariaLabel={`Średni TAT ważony: ${tatLabel}`}
					title='Średni czas realizacji ważony liczbą badań'
				/>

				<KpiCard
					icon={<Calendar size={ICON_SIZE} aria-hidden='true' />}
					value={lastFrom ? <time dateTime={isoDate(lastFrom)}>{fmtDatePL(lastFrom)}</time> : '—'}
					label='Ostatnie wykonania — od'
					ariaLabel='Ostatnie wykonania — od'
					title='Pierwsza data z ostatnich wykonań'
				/>

				<KpiCard
					icon={<CalendarCheck size={ICON_SIZE} aria-hidden='true' />}
					value={lastTo ? <time dateTime={isoDate(lastTo)}>{fmtDatePL(lastTo)}</time> : '—'}
					label='Ostatnie wykonania — do'
					ariaLabel='Ostatnie wykonania — do'
					title='Ostatnia data z ostatnich wykonań'
				/>
			</KpisGrid>
		</Section>
	)
}

KPIs.propTypes = {
	totals: PropTypes.shape({
		methods: PropTypes.number,
		tests: PropTypes.number,
		samples: PropTypes.number,
		revenue: PropTypes.number,
		labor: PropTypes.number,
		margin: PropTypes.number,
		accCnt: PropTypes.number,
		tatWeighted: PropTypes.number,
		lastFrom: PropTypes.string,
		lastTo: PropTypes.string,
	}),
	// Możesz wstrzyknąć własny formatter PLN; jeśli nie, użyje wspólnego.
	fmtPLN: PropTypes.func,
}

export default memo(KPIs)
