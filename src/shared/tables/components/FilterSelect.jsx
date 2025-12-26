// src/shared/tables/components/FilterSelect.jsx
import React, { memo } from 'react'
import PropTypes from 'prop-types'

/**
 * FilterSelect
 * Spójny select z etykietą do pasków filtrów (ListToolbar).
 * - Zachowuje klasy z „registers” (.rg-field / .rg-label / .rg-input.rg-select)
 * - Opcjonalnie renderuje "Wszystkie" na górze
 */
function FilterSelect({
	label,
	value,
	onChange,
	options = [],
	className,
	id,
	name,
	title,
	ariaLabel,
	includeAll = false,
	allValue = 'all',
	allLabel = 'Wszystkie',
	disabled = false,
}) {
	return (
		<label className={`rg-field ${className || ''}`.trim()}>
			{label && <span className='rg-label'>{label}</span>}
			<select
				id={id}
				name={name}
				value={value}
				onChange={onChange}
				className='rg-input rg-select'
				title={title || label}
				aria-label={ariaLabel || label}
				disabled={disabled}>
				{includeAll && <option value={allValue}>{allLabel}</option>}
				{options.map(opt =>
					typeof opt === 'string' ? (
						<option key={opt} value={opt}>
							{opt}
						</option>
					) : (
						<option key={opt.value ?? opt.key} value={opt.value ?? opt.key}>
							{opt.label ?? String(opt.text ?? opt.value ?? opt.key)}
						</option>
					)
				)}
			</select>
		</label>
	)
}

FilterSelect.propTypes = {
	label: PropTypes.string,
	value: PropTypes.any,
	onChange: PropTypes.func.isRequired,
	options: PropTypes.arrayOf(
		PropTypes.oneOfType([
			PropTypes.string,
			PropTypes.shape({
				key: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
				value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
				label: PropTypes.node,
				text: PropTypes.node,
			}),
		])
	),
	className: PropTypes.string,
	id: PropTypes.string,
	name: PropTypes.string,
	title: PropTypes.string,
	ariaLabel: PropTypes.string,
	includeAll: PropTypes.bool,
	allValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
	allLabel: PropTypes.node,
	disabled: PropTypes.bool,
}

export default memo(FilterSelect)
