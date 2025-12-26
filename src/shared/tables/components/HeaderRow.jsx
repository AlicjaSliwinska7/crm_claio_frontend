// src/shared/tables/components/HeaderRow.jsx
import React, { memo } from 'react'
import PropTypes from 'prop-types'
import SortableTh from './SortableTh'

/**
 * HeaderRow – buduje wiersz nagłówka z definicji kolumn.
 * Obsługuje:
 *  - kolumny sortowalne → SortableTh
 *  - kolumny niesortowalne → <th>
 *  - opcjonalną kolumnę akcji przez renderActionsHeader()
 */
function HeaderRow({
	columns = [],
	sortConfig,
	setSortConfig,
	onAfterSort,
	renderActionsHeader, // optional: () => <ActionsHeader />
}) {
	return (
		<tr>
			{columns.map((col, idx) => {
				const key = col.key ?? col.label ?? `col-${idx}`

				// kolumna niesortowalna
				if (col.sortable === false || !col.key) {
					const thClass = col.align ? `align-${col.align}` : undefined
					const style = {}
					if (col.width != null) {
						style.width = typeof col.width === 'number' ? `${col.width}px` : col.width
					}
					if (col.minWidth != null) {
						style.minWidth = typeof col.minWidth === 'number' ? `${col.minWidth}px` : col.minWidth
					}

					return (
						<th
							key={key}
							className={thClass}
							style={style}
							title={col.title}
							scope='col'
							{...(col.align ? { 'data-align': col.align } : {})}>
							<span className='th-label'>{col.label}</span>
						</th>
					)
				}

				// kolumna sortowalna
				return (
					<SortableTh
						key={key}
						columnKey={col.key}
						label={col.label}
						align={col.align}
						width={col.width}
						sortConfig={sortConfig}
						setSortConfig={setSortConfig}
						onAfterSort={onAfterSort}
					/>
				)
			})}

			{typeof renderActionsHeader === 'function' ? renderActionsHeader() : null}
		</tr>
	)
}

HeaderRow.propTypes = {
	columns: PropTypes.arrayOf(
		PropTypes.shape({
			key: PropTypes.string,
			label: PropTypes.string.isRequired,
			sortable: PropTypes.bool,
			align: PropTypes.oneOf(['left', 'center', 'right']),
			width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
			minWidth: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
			title: PropTypes.string,
		})
	),
	sortConfig: PropTypes.shape({
		key: PropTypes.string,
		direction: PropTypes.oneOf(['asc', 'desc']),
	}),
	setSortConfig: PropTypes.func,
	onAfterSort: PropTypes.func,
	renderActionsHeader: PropTypes.func,
}

export default memo(HeaderRow)
