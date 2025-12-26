// src/features/sales/pages/SamplesDeliveryPickup.jsx
import React, { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

// wspólne klocki
import { ListLayout, ListSummary, Pagination, useUrlPagination, useCsvExport } from '../../../shared/tables'
import { sortRows } from '../../../shared/tables/utils/sorters'
import { buildTypeMap } from '../../../shared/tables/utils/columns'

// lokalne komponenty
import { Controls, Table, ConfirmModal } from '../components/SamplesDeliveryPickup'

// SSOT: stałe, fallbacki danych, CSV, fabryka kolumn
import {
	VIEW_PRE,
	VIEW_PICKUP,
	VIEW_ARCH_DELIVERED,
	VIEW_ARCH_PICKEDUP,
	todayISO,
	initialPreDelivery,
	initialDeliveredHistory,
	initialPickup,
	initialPickupHistory,
	csvColumnsFor,
	makeColumns,
} from '../config/samplesDeliveryPickup.config'

const toStr = v => (v ?? '').toString()

export default function SamplesDeliveryPickup({
	preDelivery,
	setPreDelivery,
	pickup,
	setPickup,
	deliveredHistory: deliveredHistoryProp,
	setDeliveredHistory: setDeliveredHistoryProp,
	pickupHistory: pickupHistoryProp,
	setPickupHistory: setPickupHistoryProp,
}) {
	// fallbacki lokalne
	const [localPre, setLocalPre] = useState(initialPreDelivery)
	const [localPickup, setLocalPickup] = useState(initialPickup)
	const [localDeliveredHistory, setLocalDeliveredHistory] = useState(initialDeliveredHistory)
	const [localPickupHistory, setLocalPickupHistory] = useState(initialPickupHistory)

	const rowsPre = Array.isArray(preDelivery) ? preDelivery : localPre
	const rowsPickup = Array.isArray(pickup) ? pickup : localPickup
	const deliveredHistory = Array.isArray(deliveredHistoryProp) ? deliveredHistoryProp : localDeliveredHistory
	const pickupHistory = Array.isArray(pickupHistoryProp) ? pickupHistoryProp : localPickupHistory

	const updatePre = setPreDelivery || setLocalPre
	const updatePickup = setPickup || setLocalPickup
	const updateDeliveredHistory = setDeliveredHistoryProp || setLocalDeliveredHistory
	const updatePickupHistory = setPickupHistoryProp || setLocalPickupHistory

	// UI state
	const [filter, setFilter] = useState('')
	const [view, setView] = useState(VIEW_PRE)
	const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' })
	const [sp, setSp] = useSearchParams()

	// Confirm modal
	const [confirm, setConfirm] = useState({
		open: false,
		type: null,
		id: null,
		date: todayISO(),
	})

	// Handlery wykorzystywane w kolumnach (fabryka) – MEMO!
	const handlers = useMemo(
		() => ({
			askConfirmDeliver: row =>
				setConfirm({ open: true, type: 'deliver', id: row.id, date: row.deliveredAt || todayISO() }),

			patchPre: (id, patch) => updatePre(prev => prev.map(r => (r.id === id ? { ...r, ...patch } : r))),

			askConfirmPickup: row =>
				setConfirm({ open: true, type: 'pickup', id: row.id, date: row.pickedUpAt || todayISO() }),

			patchPickup: (id, patch) => updatePickup(prev => prev.map(r => (r.id === id ? { ...r, ...patch } : r))),

			updateDeliveredHistoryDate: (row, newVal) =>
				updateDeliveredHistory(prev => prev.map(x => (x.id === row.id ? { ...x, deliveredAt: newVal } : x))),

			updatePickupHistoryDate: (row, newVal) =>
				updatePickupHistory(prev => prev.map(x => (x.id === row.id ? { ...x, pickedUpAt: newVal } : x))),

			restoreFromDelivered: id => {
				const row = deliveredHistory.find(r => r.id === id)
				if (!row) return
				updatePre(prev => [{ ...row, delivered: false, deliveredAt: '' }, ...prev])
				updateDeliveredHistory(prev => prev.filter(x => x.id !== id))
			},

			restoreFromPickedUp: id => {
				const row = pickupHistory.find(r => r.id === id)
				if (!row) return
				updatePickup(prev => [{ ...row, pickedUp: false, pickedUpAt: '' }, ...prev])
				updatePickupHistory(prev => prev.filter(x => x.id !== id))
			},
		}),
		[deliveredHistory, pickupHistory, updatePre, updatePickup, updateDeliveredHistory, updatePickupHistory]
	)

	// Fabryka kolumn (DRY)
	const COLS_BY_VIEW = useMemo(() => makeColumns({ LinkCmp: Link, handlers }), [handlers])
	const COLS = COLS_BY_VIEW[view] || []

	// Dane bieżącego widoku
	const currentRows = useMemo(() => {
		switch (view) {
			case VIEW_PRE:
				return rowsPre
			case VIEW_PICKUP:
				return rowsPickup
			case VIEW_ARCH_DELIVERED:
				return deliveredHistory
			case VIEW_ARCH_PICKEDUP:
				return pickupHistory
			default:
				return []
		}
	}, [view, rowsPre, rowsPickup, deliveredHistory, pickupHistory])

	// Filtrowanie + „aktywne” zawężenie + sort
	const filteredAndSorted = useMemo(() => {
		const q = String(filter || '').toLowerCase()
		let base = (currentRows || []).filter(r =>
			Object.values(r).some(v =>
				toStr(typeof v === 'object' ? JSON.stringify(v) : v)
					.toLowerCase()
					.includes(q)
			)
		)

		if (view === VIEW_PRE) base = base.filter(r => !r.delivered)
		if (view === VIEW_PICKUP) base = base.filter(r => !r.pickedUp)

		const typeMap = buildTypeMap(COLS)
		return sortConfig.key ? sortRows(base, sortConfig, typeMap) : base
	}, [currentRows, filter, view, sortConfig, COLS])

	// Zestawienie (na dole)
	const summaryItems = useMemo(() => {
		const q = String(filter || '').toLowerCase()
		const matches = r =>
			Object.values(r).some(v =>
				toStr(typeof v === 'object' ? JSON.stringify(v) : v)
					.toLowerCase()
					.includes(q)
			)

		const waitingDelivery = (rowsPre || []).filter(r => !r.delivered && matches(r)).length
		const waitingPickup = (rowsPickup || []).filter(r => !r.pickedUp && matches(r)).length
		const allActive = waitingDelivery + waitingPickup

		return [
			['Wszystkie', allActive],
			['Czeka na dostawę', waitingDelivery],
			['Do odbioru', waitingPickup],
		]
	}, [rowsPre, rowsPickup, filter])

	// Paginacja
	const { pageCount, currentPage, visible, onPageChange, resetToFirstPage } = useUrlPagination(filteredAndSorted, {
		pageSize: 50,
		searchParams: sp,
		setSearchParams: setSp,
		param: 'page',
		scrollSelector: '.table-container, .samplesLogistics-list',
		canonicalize: true,
	})

	// CSV
	const csvColumns = useMemo(() => csvColumnsFor(view), [view])
	const exportCSV = useCsvExport({
		columns: csvColumns,
		rows: filteredAndSorted,
		filename: 'logistyka_probek.csv',
		delimiter: ';',
		includeHeader: true,
		addBOM: true,
	})

	// Potwierdzenie
	const confirmProceed = () => {
		if (!confirm.date) {
			alert('Wybierz datę.')
			return
		}
		if (confirm.type === 'deliver') {
			const row = rowsPre.find(r => r.id === confirm.id)
			if (!row) return cancelProceed()
			const withDate = { ...row, delivered: true, deliveredAt: confirm.date }
			updateDeliveredHistory(prev => [{ ...withDate }, ...prev.filter(x => x.id !== row.id)])
			updatePre(prev => prev.filter(r => r.id !== row.id))
		} else if (confirm.type === 'pickup') {
			const row = rowsPickup.find(r => r.id === confirm.id)
			if (!row) return cancelProceed()
			const withDate = { ...row, pickedUp: true, pickedUpAt: confirm.date }
			updatePickupHistory(prev => [{ ...withDate }, ...prev.filter(x => x.id !== row.id)])
			updatePickup(prev => prev.filter(r => r.id !== row.id))
		}
		cancelProceed()
	}

	const cancelProceed = () => setConfirm({ open: false, type: null, id: null, date: todayISO() })

	return (
		<ListLayout
			rootClassName='samplesLogistics-list'
			controlsClassName='samplesLogistics-controls'
			controls={
				<Controls
					filter={filter}
					setFilter={setFilter}
					view={view}
					setView={setView}
					resetToFirstPage={resetToFirstPage}
					setSortConfig={setSortConfig}
					VIEW_PRE={VIEW_PRE}
					VIEW_PICKUP={VIEW_PICKUP}
					VIEW_ARCH_DELIVERED={VIEW_ARCH_DELIVERED}
					VIEW_ARCH_PICKEDUP={VIEW_ARCH_PICKEDUP}
				/>
			}
			footer={
				<>
					<div className='table-actions table-actions--inline'>
						<Pagination currentPage={currentPage} pageCount={pageCount} onPageChange={onPageChange} />
						<button
							className='download-btn download-btn--primary'
							onClick={exportCSV}
							title='Eksportuj CSV'
							aria-label='Eksportuj CSV'>
							<i className='fa-solid fa-file-export' />
						</button>
					</div>

					<ListSummary ariaLabel='Zestawienie próbek (bieżący widok/filtr)' items={summaryItems} />
				</>
			}>
			<Table
				COLS={COLS}
				visible={visible}
				sortConfig={sortConfig}
				setSortConfig={setSortConfig}
				resetToFirstPage={resetToFirstPage}
				toStr={toStr}
			/>

			<ConfirmModal
				open={confirm.open}
				type={confirm.type}
				date={confirm.date}
				setDate={d => setConfirm(c => ({ ...c, date: d }))}
				onConfirm={confirmProceed}
				onClose={cancelProceed}
			/>
		</ListLayout>
	)
}
