// src/shared/summaries/components/DataTableLite.jsx
import React from 'react'
import PropTypes from 'prop-types'

export default function DataTableLite({ columns = [], rows = [] }) {
	return (
		<div className='tss-table-wrap'>
			<table className='tss-table' style={{ minWidth: '100%' }}>
				<thead>
					<tr>
						{columns.map(c => (
							<th key={c.key}>{c.title}</th>
						))}
					</tr>
				</thead>
				<tbody>
					{rows.length ? (
						rows.map((r, i) => (
							<tr key={r.id ?? i}>
								{columns.map(c => (
									<td key={c.key}>{r[c.key]}</td>
								))}
							</tr>
						))
					) : (
						<tr>
							<td className='tss-empty' colSpan={columns.length}>
								Brak danych.
							</td>
						</tr>
					)}
				</tbody>
			</table>
		</div>
	)
}

DataTableLite.propTypes = {
	columns: PropTypes.arrayOf(
		PropTypes.shape({
			key: PropTypes.string.isRequired,
			title: PropTypes.node.isRequired,
		})
	),
	rows: PropTypes.arrayOf(PropTypes.object),
}
