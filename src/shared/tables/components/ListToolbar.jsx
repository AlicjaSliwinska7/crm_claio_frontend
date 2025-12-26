// src/shared/tables/components/ListToolbar.jsx
import React, { memo } from 'react'
import PropTypes from 'prop-types'

/**
 * ListToolbar – pasek narzędzi nad listą/tabelą
 *
 * Obsługuje:
 *  - search: { value, placeholder?, onChange, onClear? }
 *  - actions: [{ node } | { icon, label, onClick, ... }]
 *  - bare: uproszczony wariant
 */
function ListToolbar({ bare = false, ariaLabel = 'Pasek narzędzi', className = '', search, actions = [] }) {
	const hasSearch = !!search

	const handleInput = e => {
		search?.onChange?.(e.target.value)
	}

	const renderDefaultAction = (a, i) => {
		const { key = i, icon, label, onClick, className: btnClass = 'toolbar-btn', ...rest } = a || {}
		const aria = rest['aria-label'] || label || 'Akcja'
		const title = rest.title || label || 'Akcja'

		return (
			<button key={key} type='button' className={btnClass} onClick={onClick} aria-label={aria} title={title}>
				{icon}
				{/* label chowamy, bo w oryginalnych toolbarach były ikony */}
				{label ? <span className='sr-only'>{label}</span> : null}
			</button>
		)
	}

	const renderAction = (a, i) => {
		// wariant z gotowym node
		if (a && typeof a === 'object' && 'node' in a && a.node != null) {
			const key = a.key ?? i
			return <React.Fragment key={key}>{a.node}</React.Fragment>
		}
		return renderDefaultAction(a, i)
	}

	return (
		<div
			className={['list-toolbar', bare ? 'list-toolbar--bare' : '', className].filter(Boolean).join(' ')}
			aria-label={ariaLabel}>
			{hasSearch && (
				<div className='list-toolbar__search'>
					<input
						type='search'
						className='list-toolbar__search-input'
						placeholder={search.placeholder || 'Szukaj...'}
						value={search.value || ''}
						onChange={handleInput}
						aria-label={search.placeholder || 'Szukaj'}
					/>
					{(search.value || '') !== '' && (
						<button
							type='button'
							className='list-toolbar__search-clear'
							onClick={search.onClear || (() => search.onChange?.(''))}
							aria-label='Wyczyść wyszukiwanie'
							title='Wyczyść'>
							×
						</button>
					)}
				</div>
			)}

			<div className='list-toolbar__actions'>{(actions || []).map(renderAction)}</div>
		</div>
	)
}

ListToolbar.propTypes = {
	bare: PropTypes.bool,
	ariaLabel: PropTypes.string,
	className: PropTypes.string,
	search: PropTypes.shape({
		value: PropTypes.string,
		placeholder: PropTypes.string,
		onChange: PropTypes.func,
		onClear: PropTypes.func,
	}),
	actions: PropTypes.arrayOf(
		PropTypes.oneOfType([
			// wariant: gotowy node
			PropTypes.shape({
				node: PropTypes.node,
				key: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
			}),
			// wariant: opis przycisku
			PropTypes.shape({
				key: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
				icon: PropTypes.node,
				label: PropTypes.string,
				onClick: PropTypes.func,
				className: PropTypes.string,
			}),
		])
	),
}

export default memo(ListToolbar)
