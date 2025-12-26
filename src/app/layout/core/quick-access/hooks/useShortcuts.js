// src/app/layout/core/quick-access/hooks/useShortcuts.js
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

const STORAGE_KEY = 'qa.shortcuts'
const STORAGE_VERSION = 1

function isBrowser() {
	return typeof window !== 'undefined' && typeof localStorage !== 'undefined'
}

function loadFromStorage(fallback) {
	if (!isBrowser()) return fallback
	try {
		const raw = localStorage.getItem(STORAGE_KEY)
		if (!raw) return fallback
		const parsed = JSON.parse(raw)
		// wspieramy zarówno „starą” tablicę, jak i wersjonowany obiekt
		if (Array.isArray(parsed)) return parsed
		if (parsed && parsed.v === STORAGE_VERSION && Array.isArray(parsed.items)) {
			return parsed.items
		}
		return fallback
	} catch {
		return fallback
	}
}

function saveToStorage(items) {
	if (!isBrowser()) return
	try {
		// zapis w wersjonowanym formacie (wstecz kompatybilny z odczytem starego formatu)
		localStorage.setItem(STORAGE_KEY, JSON.stringify({ v: STORAGE_VERSION, items }))
	} catch {
		/* ignore quota errors */
	}
}

function normalizeTo(to) {
	if (!to) return ''
	const s = String(to).trim()
	// jeśli wygląda na absolutny URL – nie narzucamy /
	if (/^https?:\/\//i.test(s)) return s
	// lokalne ścieżki: dokładnie jeden wiodący '/'
	return `/${s.replace(/^\/+/, '')}`
}

function makeId() {
	// preferuj crypto.randomUUID gdy dostępne
	if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
	return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export default function useShortcuts(defaultShortcuts = []) {
	const initial = useMemo(
		() => loadFromStorage(defaultShortcuts),
		[] // eslint-disable-line react-hooks/exhaustive-deps
	)

	const [shortcuts, setShortcuts] = useState(initial)
	const defaultsRef = useRef(defaultShortcuts)

	// persist na każdą zmianę
	useEffect(() => {
		saveToStorage(shortcuts)
	}, [shortcuts])

	// sync między kartami/przeładowaniami
	useEffect(() => {
		if (!isBrowser()) return
		const onStorage = e => {
			if (e.key !== STORAGE_KEY) return
			const next = loadFromStorage(shortcuts)
			const same =
				Array.isArray(next) &&
				next.length === shortcuts.length &&
				JSON.stringify(next) === JSON.stringify(shortcuts)
			if (!same) setShortcuts(next)
		}
		window.addEventListener('storage', onStorage)
		return () => window.removeEventListener('storage', onStorage)
	}, [shortcuts])

	const addShortcut = useCallback(item => {
		const label = String(item.label ?? '').trim()
		const to = normalizeTo(item.to ?? '')
		if (!label || !to) return

		setShortcuts(prev => {
			// brak duplikatów po znormalizowanej ścieżce
			if (prev.some(s => normalizeTo(s.to) === to)) return prev
			const id = item.id || makeId()
			return [...prev, { id, label, to }]
		})
	}, [])

	const removeShortcut = useCallback(id => {
		setShortcuts(prev => prev.filter(s => s.id !== id))
	}, [])

	// NOWE: zmiana kolejności po indeksach (na potrzeby drag & drop)
	const moveShortcut = useCallback((fromIndex, toIndex) => {
		setShortcuts(prev => {
			if (
				fromIndex === toIndex ||
				fromIndex < 0 ||
				toIndex < 0 ||
				fromIndex >= prev.length ||
				toIndex >= prev.length
			) {
				return prev
			}
			const next = [...prev]
			const [moved] = next.splice(fromIndex, 1)
			next.splice(toIndex, 0, moved)
			return next
		})
	}, [])

	// opcjonalne – przydatne w testach/zarządzaniu
	const replaceShortcuts = useCallback(items => {
		if (!Array.isArray(items)) return
		const cleaned = items
			.map(it => {
				const label = String(it.label ?? '').trim()
				const to = normalizeTo(it.to ?? '')
				if (!label || !to) return null
				return { id: it.id || makeId(), label, to }
			})
			.filter(Boolean)
		setShortcuts(cleaned)
	}, [])

	const resetToDefaults = useCallback(() => {
		const cleaned = (defaultsRef.current || []).map(it => ({
			id: it.id || makeId(),
			label: String(it.label ?? '').trim(),
			to: normalizeTo(it.to ?? ''),
		}))
		setShortcuts(cleaned)
	}, [])

	return {
		shortcuts,
		addShortcut,
		removeShortcut,
		moveShortcut,       // ← tu zwracamy
		replaceShortcuts,
		resetToDefaults,
	}
}
