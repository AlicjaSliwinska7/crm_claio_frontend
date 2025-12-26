// src/shared/tables/components/cells/ClientLinkCell.jsx
import React from 'react'
import { Link } from 'react-router-dom'

/**
 * Komórka z linkiem do klienta.
 *
 * Props:
 *  - value: to co wyświetlamy (np. nazwa klienta)
 *  - id?: jeśli podasz, to poleci w URL; jeśli nie, użyje value
 */
export default function ClientLinkCell({ value, id }) {
	if (!value) return '—'

	const targetId = id ?? value
	const href = `/sprzedaz/klienci/${encodeURIComponent(targetId)}`

	return <Link to={href}>{value}</Link>
}
