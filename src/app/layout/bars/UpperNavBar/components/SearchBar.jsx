// src/shared/tables/components/SearchBar.jsx
import React from 'react'
import PropTypes from 'prop-types'
import SearchField from '../../../../../shared/search/SearchField'
/**
 * Listowy pasek wyszukiwania – korzysta z kanonicznego SearchField,
 * więc ma dokładnie tę samą ikonę (Font Awesome) co globalny SearchBar.
 */
export default function SearchBar({
	value = '',
	onChange,
	placeholder = 'Szukaj w rejestrze...',
	name = 'list-search',
	autoFocus = false,
	onSubmit,
	ariaLabel,
	className = '',
	inputClassName = '',
}) {
	return (
		<SearchField
			value={value}
			onChange={onChange}
			placeholder={placeholder}
			name={name}
			autoFocus={autoFocus}
			onSubmit={onSubmit}
			ariaLabel={ariaLabel}
			className={className || 'search-wrapper'}
			inputClassName={inputClassName || 'search-bar'}
		/>
	)
}

SearchBar.propTypes = {
	value: PropTypes.string,
	onChange: PropTypes.func,
	placeholder: PropTypes.string,
	name: PropTypes.string,
	autoFocus: PropTypes.bool,
	onSubmit: PropTypes.func,
	ariaLabel: PropTypes.string,
	className: PropTypes.string,
	inputClassName: PropTypes.string,
}
