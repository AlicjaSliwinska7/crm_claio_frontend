import React, { useMemo } from 'react'
import ListSummary from '../../../shared/tables/components/ListSummary'
import { STATUS_DEFS, OUTCOME_DEFS, norm } from './constants'

/**
 * Pasek podsumowań (statusy + wyniki) – dane liczymy na podstawie
 * przefiltrowanej listy `rows`.
 */
export default function TestsSummary({ rows }) {
	const statusItems = useMemo(() => {
		const counts = new Map(STATUS_DEFS.map(s => [s.key, 0]))
		for (const r of rows) {
			const k = norm(r.status)
			if (counts.has(k)) counts.set(k, (counts.get(k) || 0) + 1)
		}
		const items = [['Badania', rows.length]]
		STATUS_DEFS.forEach(s => {
			const n = counts.get(s.key) || 0
			if (n > 0) items.push([s.label, n])
		})
		return items
	}, [rows])

	const outcomeItems = useMemo(() => {
		const counts = new Map(OUTCOME_DEFS.map(o => [o.key, 0]))
		for (const r of rows) {
			const k = norm(r.outcome)
			if (counts.has(k)) counts.set(k, (counts.get(k) || 0) + 1)
		}
		const items = [['Badania', rows.length]]
		OUTCOME_DEFS.forEach(o => {
			const n = counts.get(o.key) || 0
			if (n > 0) items.push([o.label, n])
		})
		return items
	}, [rows])

	return (
		<div
			className='list-summary'
			role='status'
			aria-label='Podsumowanie rejestru badań'
			style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
			<ListSummary ariaLabel='Podsumowanie rejestru badań (statusy)' items={statusItems} />
			<ListSummary ariaLabel='Podsumowanie rejestru badań (wyniki)' items={outcomeItems} />
		</div>
	)
}
